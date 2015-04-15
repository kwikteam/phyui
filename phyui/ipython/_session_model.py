# -*- coding: utf-8 -*-
import os.path

from IPython.html.widgets import Widget
from IPython.utils.traitlets import Int, Unicode, CUnicode, List
from phy.io.kwik_model import list_kwik
from phy.utils.settings import declare_namespace

class ClusteringSessionModel(Widget):
    """
    widget is used as a base class for communicating between python and the frontend.
    """

    files = List(sync=True)
    current = CUnicode(sync=True)
    status = CUnicode("close", sync=True)
    status_desc = CUnicode(sync=True)
    debug = CUnicode(sync=True)

    def __init__(self, session, *args, **kwargs):
        super(ClusteringSessionModel, self).__init__(*args, **kwargs)

        self.on_msg(self._handle_button_msg)
        self.session = session

        self.folders = self.session.settings_manager.get_user_settings('phy.data_search_dirs', scope='global')
        self.files = list_kwik(self.folders)

    def _handle_button_msg(self, _, content):
        """Handle a msg from the front-end.

        Parameters
        ----------
        content: dict
            Content of the msg."""
        self.debug = "debug: " + str(content)
        try:
            if content.get('event', '') == 'open':
                self.debug = "debug-ope: " + str(content)
                self.session_open(content.get('filename'))
            elif content.get('event', '') == 'close':
                self.debug = "debug-clo: " + str(content)
                self.session_close()
            else:
                raise Exception("command not implemented for ", str(content))
        except Exception as err:
            self.set_status("error", str(err))

    def set_session(self, session):
        self.session = session

    def set_status(self, status, status_desc=""):
        self.status = status
        self.status_desc = status_desc

    def session_open(self, filename):
        try:
            self.set_status("opening")
            self.session.open(str(filename))
            self.current = filename
            self.set_status("open", "experiment: "  + filename)
        except Exception as err:
            #import traceback
            #self.set_status("error", traceback.format_exc())
            self.filename = "None" #avoid set_status('close')
            self.current = "None"
            raise

    def session_close(self):
        self.set_status("close")
        self.session.close()
