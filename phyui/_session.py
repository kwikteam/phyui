# -*- coding: utf-8 -*-

"""Session structure."""

#------------------------------------------------------------------------------
# Imports
#------------------------------------------------------------------------------

import os.path
from phy.plot.waveforms import WaveformView, add_waveform_view
from phy.cluster.manual.session import Session

from .cluster_view import ClusterView, cluster_info
from ._session_model import SessionModel

from IPython.display import display

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

    def iwant(self):
        self.uimodel.send_state()
        #data={'model_name': self.uimodel._model_name,
    #          'model_module': self.uimodel._model_module}
    #    self.uimodel.comm.open(data)

    def __init__(self, *args, **kwargs):
        super(UISession, self).__init__(*args, **kwargs)
        self.action(self.show_waveforms, "Show waveforms")

        def _on_current(name, old, new):
            print "bim:", new
            self.open(new)
        self.filename = None
        self.uimodel = SessionModel()
        self.uimodel.files = [ 'None', 'test_hybrid_120sec.kwik' ];
        self.uimodel.on_trait_change(_on_current, 'current');

    #override Session.open
    def open(self, filename):
        if filename == self.filename:
            return
        self.filename = filename
        if filename == "None":
            #self.close()
            self.uimodel.set_status("close")
            return
        try:
            self.uimodel.set_status("opening")
            super(UISession, self).open(os.path.join(self.data_store_path, str(filename)));
            self.uimodel.set_status("open")
            #self.uimodel.current = filename
        except Exception as err:
            #import traceback
            #self.uimodel.set_status("error", traceback.format_exc())
            self.uimodel.set_status("error", str(err))
            self.filename = "None" #avoid set_status('close')
            self.uimodel.current = "None"
            raise

    def show_waveforms(self, backend='qt'):
        """ 'qt' | 'ipynb_webgl'
        """
        view = add_waveform_view(self, backend=backend)
        w = view.show()
        return view

    def show_clusters(self, backend='ipynb_webgl'):
        """Create and show a new cluster view."""

        if backend != 'ipynb_webgl':
            raise RuntimeError("Only implemented for IPython notebook")
        # TODO: use the model instead
        if hasattr(self, "clustering"):
            clusters = [cluster_info(c, quality=0, nchannels=1,
                                    nspikes=2, ccg=None)
                                    for c in self.clustering.cluster_ids]
        else:
            clusters = []
        view = ClusterView(clusters=clusters)

        def on_select(_, __, clusters):
            self.select([int(x) for x in clusters])

        view.on_trait_change(on_select, 'value')

        display(view)
        return view


_session = None

#the global session
def session():
    global _session
    if _session is None:
        _session = UISession();
    return _session
