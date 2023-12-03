![Preview](https://raw.githubusercontent.com/mschuchard/linter-kubectl/master/linter_kubectl.png)

### Linter-kubectl
`Linter-Kubectl` aims to provide functional and robust `kubectl` linting functionality within Pulsar.

This package is now in maintenance mode. All feature requests and bug reports in the Github repository issue tracker will receive a response, and possibly also be implemented (especially bug fixes). However, active development on this package has ceased.

### Installation
`kubectl >= 1.18` is required to be installed before using this. You also need a valid Kubernetes cluster connection for `kubectl`. The Atom-IDE-UI and Language-Yaml packages are also required.

All testing is performed with the latest stable version of Pulsar. Any version of Atom or any pre-release version of Pulsar is not supported.

### Usage
- All YAML files with a `apiVersion` key that has a value containing a `v` followed by a number will be linted with this linter. Be aware of this in case you have a non-Kubernetes YAML file with this characteristic. Also be aware of this in case you have a typo for the `apiVersion` key, since this linter will then not trigger.
- If your Kubernetes manifest has a YAML parsing error, this linter will notify of it but not provide specific information about it. Please use a YAML Linter for that functionality.
