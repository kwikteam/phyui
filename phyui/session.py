# -*- coding: utf-8 -*-

"""Session structure."""

#------------------------------------------------------------------------------
# Imports
#------------------------------------------------------------------------------

from phyui.plot.waveforms import WaveformView
from phyui.cluster_view import ClusterView
from phy.cluster.manual.session import Session
from phyui.utils import enable_notebook


class UISession(Session):
    """Default manual clustering session in the IPython notebook.

    Parameters
    ----------
    filename : str
        Path to a .kwik file, to be used if 'model' is not used.
    model : instance of BaseModel
        A Model instance, to be used if 'filename' is not used.
    backend : str
        VisPy backend. For example 'pyqt4' or 'ipynb_webgl'.

    """
    def __init__(self, store_path=None, backend=None):
        super(UISession, self).__init__(store_path, backend)

    def show_waveforms(self):
        if self._backend in ('pyqt4', None):
            kwargs = {'always_on_top': True}
        else:
            kwargs = {}
        view = WaveformView(**kwargs)

        @self.connect
        def on_open():
            if self.model is None:
                return
            view.visual.spike_clusters = self.clustering.spike_clusters
            view.visual.cluster_metadata = self.cluster_metadata
            view.visual.channel_positions = self.model.probe.positions
            view.update()

        @self.connect
        def on_cluster(up=None):
            pass
            # TODO: select the merged cluster
            # self.select(merged)

        @self.connect
        def on_select():
            spikes = self.selector.selected_spikes
            if len(spikes) == 0:
                return
            view.visual.waveforms = self.model.waveforms[spikes]
            view.visual.masks = self.model.masks[spikes]
            view.visual.spike_ids = spikes
            view.update()

        # Unregister the callbacks when the view is closed.
        @view.connect
        def on_close(event):
            self.unconnect(on_open, on_cluster, on_select)

        view.show()

        # Update the view if the model was already opened.
        on_open()
        on_select()

        return view

    def show_clusters(self):
        """Create and show a new cluster view."""

        # TODO: no more 1 cluster = 1 color, use a fixed set of colors
        # for the selected clusters.
        cluster_colors = [self.cluster_metadata.color(cluster)
                          for cluster in self.clustering.cluster_ids]
        try:
            #view = ClusterView(clusters=self.clustering.cluster_ids,
            #                   colors=cluster_colors)
            clusters = [ cluster_info(c, quality=0, nchannels=1, nspikes=2, ccg=None) for c in session.clustering.cluster_labels]
            view = ClusterView(clusters=clusters, colors=cluster_colors)
            self.view = view
        except RuntimeError:
            warn("The cluster view only works in IPython.")
            return
        view.on_trait_change(lambda _, __, clusters: self.select(clusters),
                             'value')
        load_css('static/d3clusterwidget.css')
        load_css('static/widgets.css')
        from IPython.display import display
        display(view)
        return view


#------------------------------------------------------------------------------
# Helper functions
#------------------------------------------------------------------------------

def start_manual_clustering(filename=None, model=None, session=None,
                            store_path=None, backend=None):
    """Start a manual clustering session in the IPython notebook.

    Parameters
    ----------
    session : BaseSession
        A BaseSession instance
    filename : str
        Path to a .kwik file, to be used if 'model' is not used.
    model : instance of BaseModel
        A Model instance, to be used if 'filename' is not used.

    """

    if session is None:
        session = UISession(store_path=store_path, backend=backend)

    # Enable the notebook interface.
    enable_notebook(backend=backend)

    session.open(filename=filename, model=model)
    session.show_clusters()

    return session
