![Preview](https://raw.githubusercontent.com/mschuchard/linter-kubectl/master/linter_kubectl.png)

### Linter-kubectl
[![Build Status](https://travis-ci.com/mschuchard/linter-kubectl.svg?branch=master)](https://travis-ci.com/mschuchard/linter-kubectl)

`Linter-Kubectl` aims to provide functional and robust `kubectl` linting functionality within Atom.

### Installation
`kubectl >= 1.18` is required to be installed before using this. You also need a valid Kubernetes cluster connection for `kubectl`. The `Linter` and `Language-Yaml` Atom packages are also required.

### Usage
- All YAML files with a `apiVersion` key that has a value containing a `v` followed by a number will be linted with this linter. Be aware of this in case you have a non-Kubernetes YAML file with this characteristic. Also be aware of this in case you have a typo for the `apiVersion` key, since this linter will then not trigger.
- If your Kubernetes manifest has a YAML parsing error, this linter will notify of it but not provide specific information about it. Please use a YAML Linter for that functionality.
