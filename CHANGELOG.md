### Next (Roadmap)
- Ignore linting Helm Chart metadata files.

- create fixture for multiple errors
- get travis working
- 1.18 --> --dry-run='none': Must be "none", "server", or "client". If client strategy, only print the object that would be sent, without sending it. If server strategy, submit server-side request without persisting the resource.

### 1.0.2
- Add config option for server side dry run.
- Add warning for kubectl version 1.18 incompatibility.

### 1.0.1
- Fix overly restrictive check on Kubernetes `apiVersion` key.
- Fix incorrect usage of kubeconfig setting.

### 1.0.0
- Initial version ready for wide usage.
