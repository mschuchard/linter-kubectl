'use babel';

export default {
  config: {
    kubectlExecutablePath: {
      title: 'Kubectl Executable Path',
      type: 'string',
      description: 'Path to kubectl executable (e.g. /usr/local/bin/kubectl) if not in shell env path.',
      default: 'kubectl',
    },
    kubeConfig: {
      title: 'Kube Config Path',
      type: 'string',
      description: 'Path to a non-default kubeconfig that kubectl should utilize.',
      default: '',
    },
    serverDryRun: {
      title: 'Server Dry Run',
      type: 'boolean',
      description: 'Dry run request is sent to the server instead of run on client.',
      default: false,
    },
  },

  // activate linter
  activate() {
    const { CompositeDisposable } = require('atom');
    this.idleCallbacks = new Set();
    this.subscriptions = new CompositeDisposable();
    this.helpers = require('atom-linter');

    // check for kubectl >= minimum version
    this.helpers.exec(atom.config.get('linter-kubectl.kubectlExecutablePath'), ['apply', '--help']).then(output => {
      // kubectl < 1.18
      if (!(/--dry-run='none'/.exec(output))) {
        atom.notifications.addError(
          'The kubectl installed in your path is too old to support the modern kubectl apply --dry-run command usage.',
          { detail: 'Please upgrade your version of kubectl to >= 1.18.' }
        );
      }
    });
  },

  deactivate() {
    this.idleCallbacks.forEach((callbackID) => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'Kubernetes',
      grammarScopes: ['source.yaml'],
      scope: 'file',
      lintsOnChange: false,
      lint: async (textEditor) => {
        // bail out if this is not a kubernetes manifest
        if (!(/apiVersion:\s*v\d/.exec(textEditor.getText()))) return [];

        // setup variables
        const file = textEditor.getPath();

        // bail out if this is a helm Chart.yaml (metadata) since that also includes an apiVersion key
        if (/Chart\.yaml/.exec(file))
          return [];

        // setup args for validating
        const args = ['apply'];

        // select either client or server dry run
        if (atom.config.get('linter-kubectl.serverDryRun'))
          args.push('--dry-run=server');
        else
          args.push('--dry-run=client');

        // enable kubeconfig switching
        if (atom.config.get('linter-kubectl.kubeConfig') !== '')
          args.push(...['--kubeconfig', atom.config.get('linter-kubectl.kubeConfig')]);

        // add file to check
        args.push(...['-f', file]);

        return this.helpers.exec(atom.config.get('linter-kubectl.kubectlExecutablePath'), args, { stream: 'stderr', allowEmptyStderr: true }).then(output => {
          const toReturn = [];

          output.split(/\r?\n/).forEach((line) => {
            // setup matchers for output parsing
            const lintMatches = /error:.*\.ya?ml": (.*);?/.exec(line);
            const newLintMatches = /from server for: ".*\.ya?ml": (.*);?/.exec(line);
            const yamlMatches = /error converting YAML to JSON/.exec(line);

            // check for yaml syntax error
            if (yamlMatches != null) {
              toReturn.push({
                severity: 'info',
                excerpt: 'Error parsing YAML. Use a YAML Linter for specific assistance.',
                location: {
                  file,
                  position: [[0, 0], [0, 1]],
                },
              });
            } else if (lintMatches != null) { // check for normal linter output
              // cannot write regexp to ignore validate message so replacing string
              const excerpt = lintMatches[1].replace(/;.*validate=false/, '');

              toReturn.push({
                severity: 'error',
                excerpt,
                location: {
                  file,
                  position: [[0, 0], [0, 1]],
                },
              });
            } else if (newLintMatches != null) { // check for normal linter output in new format
              toReturn.push({
                severity: 'error',
                excerpt: newLintMatches[1],
                location: {
                  file,
                  position: [[0, 0], [0, 1]],
                },
              });
            }
          });
          return toReturn;
        });
      }
    };
  }
};
