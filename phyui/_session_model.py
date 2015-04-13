# -*- coding: utf-8 -*-

from IPython.html.widgets import Widget
from IPython.utils.traitlets import Int, Unicode, CUnicode, List

class SessionModel(Widget):
    """
    widget is used as a base class for communicating between python and the frontend.
    """

    files = List(sync=True)
    current = CUnicode(sync=True)
    status = CUnicode("close", sync=True)
    status_desc = CUnicode(sync=True)

    def __init__(self, *args, **kwargs):
        super(SessionModel, self).__init__(*args, **kwargs)
        pass

    def set_status(self, status, status_desc=""):
        self.status = status
        self.status_desc = status_desc
