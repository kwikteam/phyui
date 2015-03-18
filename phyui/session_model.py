# -*- coding: utf-8 -*-

from IPython.html.widgets import Widget
from IPython.utils.traitlets import Int, Unicode, CUnicode, List

class SessionModel(Widget): #widget is used as a base class for communicating between python and the frontend.
    files = List(sync=True)
    current = CUnicode(sync=True)
    _view_name = Unicode('SessionController', sync=True)
    #_view_module = Unicode('/nbextensions/phyui/notebook/js/sessioncontroller', sync=True)

    def __init__(self, *args, **kwargs):
        super(SessionModel, self).__init__(*args, **kwargs)
        pass
