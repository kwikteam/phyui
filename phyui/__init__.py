# -*- coding: utf-8 -*-

__author__ = 'Kwik Team'
__email__ = 'cyrille.rossant at gmail.com'
__version__ = '0.1.0-alpha'


def prepare_js():
    """ This is needed to map js/css to the nbextensions folder
    """
    from IPython.html import nbextensions
    import os
    pkgdir = os.path.join(os.path.dirname(__file__), "..", "static", "phyui")
    nbextensions.install_nbextension(pkgdir, symlink=True, user=True, destination='phyui')

prepare_js()
