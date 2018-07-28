'use babel';

import SourceFetch from '../lib/source-fetch';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('SourceFetch', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('source-fetch');
  });

  describe('when the source-fetch:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.source-fetch')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'source-fetch:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.source-fetch')).toExist();

        let sourceFetchElement = workspaceElement.querySelector('.source-fetch');
        expect(sourceFetchElement).toExist();

        let sourceFetchPanel = atom.workspace.panelForItem(sourceFetchElement);
        expect(sourceFetchPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'source-fetch:toggle');
        expect(sourceFetchPanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.source-fetch')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'source-fetch:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let sourceFetchElement = workspaceElement.querySelector('.source-fetch');
        expect(sourceFetchElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'source-fetch:toggle');
        expect(sourceFetchElement).not.toBeVisible();
      });
    });
  });
});
