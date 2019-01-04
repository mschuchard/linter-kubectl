'use babel';

import * as path from 'path';

describe('The Kubectl provider for Linter', () => {
  const lint = require(path.join(__dirname, '../lib/main.js')).provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-kubectl');
      return atom.packages.activatePackage('language-yaml').then(() =>
        atom.workspace.open(path.join(__dirname, 'fixtures', 'clean.yaml'))
      );
    });
  });

  describe('checks a file with a key issue and', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures', 'syntax-bad-key.yml');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual('error validating data: ValidationError(Namespace): unknown field "metdata" in io.k8s.api.core.v1.Namespace');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+syntax-bad-key\.yaml$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[0, 0], [0, 1]]);
        });
      });
    });
  });

  describe('checks a file with a value issue and', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures', 'syntax-bad-value.yml');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual('no matches for kind "doesnotexist" in version "v1"');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+syntax-bad-value\.yaml$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[0, 0], [0, 1]]);
        });
      });
    });
  });

  describe('checks a file with a yaml error', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures', 'syntax-bad-yaml.yaml');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual("Error parsing YAML. Use a YAML Linter for specific assistance.");
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+syntax-bad-yaml\.yaml$/);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures', 'clean.yaml');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
    });
  });
});
