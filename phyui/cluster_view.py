# -*- coding: utf-8 -*-

"""Cluster view in HTML."""

#------------------------------------------------------------------------------
# Imports
#------------------------------------------------------------------------------

import random

import numpy as np
from IPython.utils.traitlets import Unicode, List
from IPython.html.widgets import DOMWidget


#------------------------------------------------------------------------------
# Cluster view
#------------------------------------------------------------------------------

# TODO: use the model instead
def _genccg():
    nbins = 41
    bins = [None] * (nbins + 1)

    bins[0] = 0
    bins[nbins] = 0

    for i in range(1, nbins//2):
        binval = random.randint(0, 120)
        bins[i] = binval
        bins[nbins-i] = binval
    return bins


def cluster_info(clusterid, quality, nchannels, nspikes, ccg):
    """ ccg is a list[4] of list[41]
    """
    return {'id': clusterid,
            'quality': quality,
            'nchannels': nchannels,
            'nspikes': nspikes,
            'ccg': _genccg(),
            }


class ClusterView(DOMWidget):
    _view_name = Unicode('ClusterWidget', sync=True)
    _view_module = Unicode('/nbextensions/phyui/cluster/js/widgets.js',
                           sync=True)
    description = Unicode(help="Description", sync=True)
    clusters = List(sync=True)
    colors = List(sync=True)
    value = List(sync=True)   # list of ids

    def __init__(self, *args, **kwargs):
        super(ClusterView, self).__init__(*args, **kwargs)
