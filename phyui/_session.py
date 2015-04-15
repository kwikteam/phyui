# -*- coding: utf-8 -*-

"""Session structure."""

#------------------------------------------------------------------------------
# Imports
#------------------------------------------------------------------------------

import os.path
from phy.cluster.manual.session import Session

_session = None

#the global session
def session():
    global _session
    if _session is None:
        _session = Session();
    return _session
