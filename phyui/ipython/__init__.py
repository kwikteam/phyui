## -*- coding: utf-8 -*-
## Author(s):
##  - Cedric Gestes <cedric.gestes@gmail.com>
##

import os.path

from IPython.html import nbextensions

def prepare_js():
    """ This is needed to map js/css to the nbextensions folder
    """
    pkgdir = os.path.join(os.path.dirname(__file__), "static")
    nbextensions.install_nbextension(pkgdir, symlink=True, user=True,
                                     destination='phyui')

prepare_js()

from ._session_model import ClusteringSessionModel
from .cluster_view import add_cluster_view
