# -*- coding: utf-8 -*-

"""Session structure."""

#------------------------------------------------------------------------------
# Imports
#------------------------------------------------------------------------------

import os.path
from phy.plot.waveforms import WaveformView, add_waveform_view
from phy.cluster.manual.session import Session

from IPython.display import JSON
from .cluster_view import ClusterView, cluster_info
from .session_model import SessionModel

class UISession(Session):
    """Default manual clustering session in the IPython notebook.

    Parameters
    ----------
    filename : str
        Path to a .kwik file, to be used if 'model' is not used.
    model : instance of BaseModel
        A Model instance, to be used if 'filename' is not used.
    """

    data_store_path = '/home/ctaf/src/cortex/data/'

    def __init__(self, *args, **kwargs):
        super(UISession, self).__init__(*args, **kwargs)
        self.uimodel = SessionModel()
        self.action(self.show_waveforms, "Show waveforms")
        self.filename = None

    #override Session.open
    def open(self, filename):
        super(UISession, self).open(os.path.join(self.data_store_path, filename));
        self.filename = filename

    def list_kwik_files(self):
        """ [ current, [ candidates ] ]
        """
        return JSON( [ self.filename, [ 'filename1', 'filename2', 'test_hybrid_120sec.kwik' ] ] );

    def show_waveforms(self):
        view = add_waveform_view(self, backend='ipynb_webgl')
        return view

    def show_clusters(self):
        """Create and show a new cluster view."""

        # TODO: use the model instead
        cluster_colors = [(1., 0., 0.)
                          for cluster in self.clustering.cluster_ids]
        clusters = [cluster_info(c, quality=0, nchannels=1,
                                 nspikes=2, ccg=None)
                    for c in self.clustering.cluster_ids]
        view = ClusterView(clusters=clusters, colors=cluster_colors)

        def on_select(_, __, clusters):
            self.select([int(x) for x in clusters])

        view.on_trait_change(on_select, 'value')

        from IPython.display import display
        display(view)

        return view


_session = None

#the global session
def session():
    global _session
    if _session is None:
        _session = UISession();
    return _session

# #------------------------------------------------------------------------------
# # Helper functions
# #------------------------------------------------------------------------------

# def start_manual_clustering(filename=None):
#     """Start a manual clustering session in the IPython notebook.

#     Parameters
#     ----------
#     session : BaseSession
#         A BaseSession instance
#     filename : str
#         Path to a .kwik file, to be used if 'model' is not used.
#     model : instance of BaseModel
#         A Model instance, to be used if 'filename' is not used.

#     """

#     if session is None:
#         session = UISession()


#     session.open(filename=filename)
#     return session
