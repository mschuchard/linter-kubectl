'use babel';

export default {
  config: {
    kubectlExecutablePath: {
      title: 'Kubectl Executable Path',
      type: 'string',
      description: 'Path to Kubectl executable (e.g. /usr/bin/kubectl) if not in shell env path.',
      default: 'kubectl',
    },
    kubeConfig: {
      title: 'Kube Config Path',
      type: 'string',
      description: 'Path to the kubeconfig that kubectl should utilize. Leave this empty to not override this setting in Atom.',
      default: '',
    },
    serverDryRun: {
      title: 'Server Dry Run',
      type: 'boolean',
      description: 'Dry run request is sent to the server instead of run on client.',
      default: false,
    },
    newVersion: {
      title: 'Kubectl >= 1.18',
      type: 'boolean',
      description: 'Your installed version of kubectl is >= 1.18.',
      default: false,
    }
  },

  // activate linter
  activate() {
    const helpers = require("atom-linter");

    // check for kubectl >= minimum version
    helpers.exec(atom.config.get('linter-kubectl.kubectlExecutablePath'), ['apply', '--help']).then(output => {
      if (/--dry-run='none'/.exec(output)) {
        // kubectl >= 1.18
        atom.config.set('linter-kubectl.newVersion', true);
      }
      else if (!(/--dry-run=false/.exec(output))) {
        // kubectl < 1.7
        atom.notifications.addError(
          'The kubectl installed in your path is too old to support the kubectl apply --dry-run command.',
          {
            detail: "Please upgrade your version of kubectl to >= 1.7.\n"
          }
        );
      }
      else {
        // kubectl >= 1.7 < 1.18
        atom.config.set('linter-kubectl.newVersion', false);
      }
    });
  },

  provideLinter() {
    return {
      name: 'Kubernetes',
      grammarScopes: ['source.yaml'],
      scope: 'file',
      lintsOnChange: false,
      lint: (activeEditor) => {
        // bail out if this is not a kubernetes manifest
        if (!(/apiVersion:.*v\d/.exec(activeEditor.getText())))
          return [];

        // setup variables
        const helpers = require('atom-linter');
        const lint_regex = /error: .*\.ya?ml": (.*);?/;
        const file = activeEditor.getPath();

        // bail out if this is a helm Chart.yaml (metadata) since that also includes a apiVersion key
        if (/Chart\.yaml/.exec(file))
          return [];

        // setup args for validating
        var args = ['apply'];

        // select either client or server dry run
        if (atom.config.get('linter-kubectl.newVersion')) {
          // flags for kubectl >= 1.18
          if (atom.config.get('linter-kubectl.serverDryRun'))
            args.push('--dry-run=server');
          else
            args.push('--dry-run=client');
        }
        else {
          // flags for kubectl >= 1.7 and < 1.18
          if (atom.config.get('linter-kubectl.serverDryRun'))
            args.push('--server-dry-run');
          else
            args.push('--dry-run');
        }

        // enable kubeconfig switching
        if (atom.config.get('linter-kubectl.kubeConfig') !== '')
          args.push(...['--kubeconfig', atom.config.get('linter-kubectl.kubeConfig')]);

        // add file to check
        args.push(...['-f', file]);

        return helpers.exec(atom.config.get('linter-kubectl.kubectlExecutablePath'), args, {stream: 'stderr', allowEmptyStderr: true}).then(output => {
          var toReturn = [];

          output.split(/\r?\n/).forEach((line) => {
            // setup matchers for output parsing
            const lint_matches = lint_regex.exec(line);
            const yaml_matches = /error converting YAML to JSON/.exec(line);
            const connect_matches = /(\d+\.\d+\.\d+\.\d+:\d+): connect:/.exec(line)

            // first check for connection issue to cluster
            if (connect_matches != null) {
              toReturn.push({
                severity: 'info',
                excerpt: 'Kubectl is unable to connect to your configured cluster at ' + connect_matches[1],
                location: {
                  file: file,
                  position: [[0, 0], [0, 1]],
                },
              });
            }
            // check for yaml syntax error
            else if (yaml_matches != null) {
              toReturn.push({
                severity: 'info',
                excerpt: 'Error parsing YAML. Use a YAML Linter for specific assistance.',
                location: {
                  file: file,
                  position: [[0, 0], [0, 1]],
                },
              });
            }
            // check for normal linter output
            else if (lint_matches != null) {
              // cannot write regexp to ignore validate message so replacing string
              excerpt = lint_matches[1].replace(/;.*validate=false/, '')

              toReturn.push({
                severity: 'error',
                excerpt: excerpt,
                location: {
                  file: file,
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
