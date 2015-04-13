# -*- coding: utf-8 -*-

from IPython.html.widgets import Widget
from IPython.utils.traitlets import Int, Unicode, CUnicode, List
from phy.io.kwik_model import list_kwik

class SessionModel(Widget):
    """
    widget is used as a base class for communicating between python and the frontend.
    """

    files = List(sync=True)
    current = CUnicode(sync=True)
    status = CUnicode("close", sync=True)
    status_desc = CUnicode(sync=True)

    def __init__(self, session, *args, **kwargs):
        super(SessionModel, self).__init__(*args, **kwargs)

        self.session = session
        self.files = list_kwik(['/home/ctaf/src/cortex/data'])

        def _on_current(name, old, new):
            self.session_open(new)
        self.on_trait_change(_on_current, 'current');

    def set_session(self, session):
        self.session = session

    def set_status(self, status, status_desc=""):
        self.status = status
        self.status_desc = status_desc

    def session_open(self, filename):
        if filename == self.filename:
            return
        self.filename = filename
        if filename == "None":
            #self.close()
            self.uimodel.set_status("close")
            return
        try:
            self.uimodel.set_status("opening")
            self.session.open(os.path.join(self.data_store_path, str(filename)));
            self.uimodel.set_status("open")
            #self.uimodel.current = filename
        except Exception as err:
            #import traceback
            #self.uimodel.set_status("error", traceback.format_exc())
            self.uimodel.set_status("error", str(err))
            self.filename = "None" #avoid set_status('close')
            self.uimodel.current = "None"
            raise
