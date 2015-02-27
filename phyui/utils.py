# -*- coding: utf-8 -*-

"""Notebook utilities."""

#------------------------------------------------------------------------------
# Imports
#------------------------------------------------------------------------------

import os
import os.path as op

from IPython.display import display_javascript, display_html


#------------------------------------------------------------------------------
# JavaScript and CSS utility
#------------------------------------------------------------------------------

def _to_abs_path(path):
    """Transform a path relative to the root of the phy package to an
    absolute path."""
    current_directory = op.dirname(op.realpath(__file__))
    root = op.join(current_directory, '../')
    return op.join(root, path)

def _to_web(path):
    current_directory = os.path.join(op.dirname(op.realpath(__file__)), "..")
    return op.relpath(_to_abs_path(path), current_directory)


def _read_file(path):
    """Read a text file specified with an absolute path."""
    with open(path, 'r') as f:
        return f.read()


def _inject_js(path, async=True):
    """Inject a JS file in the notebook.

    Parameters
    ----------

    path : str
        Absolute path to a .js file.

    """
    if async:
        myjs = "$('head').append(\"<script> require(['/nbextensions/" + _to_web(path) + "']); </script>\")"
    else:
        myjs = "$('head').append(\"<script type='text/javascript' src='/nbextensions/" + _to_web(path) + "'/>\")"
    display_javascript(myjs, raw=True)


def _inject_css(path):
    """Inject a CSS file in the notebook.

    Parameters
    ----------

    path : str
        Absolute path to a .css file.

    """
    #inject in head so it does not disappear with the outputarea
    mycss = '$("head").append(\'<link rel="stylesheet" href="/nbextensions/' + _to_web(path) + '" type="text/css"/>\')'
    display_javascript(mycss, raw=True)


def load_js(path, async=False):
    """Load a CSS file specified with a path relative to the root
    of the phy module."""
    _inject_js(_to_abs_path(path), require=require)

def load_css(path):
    """Load a CSS file specified with a path relative to the root
    of the phy module."""
    _inject_css(_to_abs_path(path))


#------------------------------------------------------------------------------
# Event loop integration
#------------------------------------------------------------------------------

VISPY_BACKENDS = ('pyqt4',
                  'wx',
                  'ipynb_webgl')


def _enable_gui(shell, backend):
    """Enable IPython GUI event loop integration."""
    shell.run_line_magic('gui', backend)


def ipython_shell():
    """Return True if we are in IPython."""
    # Import IPython.
    try:
        import IPython
        from IPython import get_ipython
    except ImportError:
        raise ImportError("IPython is required.")
    if IPython.__version__ < '3':
        raise ImportError("IPython >= 3.0 is required.")
    # Get the IPython shell.
    shell = get_ipython()
    return shell


def enable_notebook(backend=None):
    """Enable notebook integration with the given backend for VisPy."""
    # TODO: unit tests
    if backend not in (None,) + VISPY_BACKENDS:
        raise ValueError("'backend' must be one of: "
                         "{0:s}".format(', '.join(VISPY_BACKENDS)))
    # Import VisPy.
    try:
        from vispy import app
    except ImportError:
        raise ImportError("VisPy is required in the notebook.")
    # Default backend.
    if backend is None:
        # TODO: user-level parameter
        backend = 'pyqt4'
    # Enable the VisPy backend.
    app.use_app(backend)
    # Enable IPython event loop integration.
    shell = ipython_shell()
    if shell is not None:
        if backend == 'pyqt4':
            _enable_gui(shell, 'qt')
        elif backend == 'wx':
            _enable_gui(shell, 'wx')
