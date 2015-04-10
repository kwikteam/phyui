#!/usr/bin/env python
##
## Author(s):
##  - Cedric Gestes <cedric.gestes@gmail.com>
##

from phyui.qt.dock import ViewDockWidget, DockTitleBar

from phyui.qt.qtversion import QtCore, QtGui

import phyui


from vispy import app

app.use_app("pyqt4")
from vispy.app.qt import QtCanvas




class ManualClusteringMainWindow(QtGui.QMainWindow):
    def __init__(self, parent=None):
        super(ManualClusteringMainWindow, self).__init__(parent)

        self.settings = QtCore.QSettings()
        self.setObjectName("MainWindow")
        self.resize(128, 64)

        self.menubar = QtGui.QMenuBar(self)
        self.menubar.setGeometry(QtCore.QRect(0, 0, 82, 21))
        self.menubar.setObjectName("menubar")
        self.setMenuBar(self.menubar)

        self.statusbar = QtGui.QStatusBar(self)
        self.statusbar.setObjectName("statusbar")
        self.setStatusBar(self.statusbar)

        self.retranslateUi()
        QtCore.QMetaObject.connectSlotsByName(self)

        # Dock widgets options
        self.setDockOptions(QtGui.QMainWindow.AllowTabbedDocks|QtGui.QMainWindow.AllowNestedDocks|QtGui.QMainWindow.AnimatedDocks)

        canv = phyui.session().show_waveforms(show=False).view
        self.create_view(canv.native, "Waveforms", position=QtCore.Qt.RightDockWidgetArea)

        feat = phyui.session().show_features(show=False).view
        self.create_view(feat.native, "Features", position=QtCore.Qt.LeftDockWidgetArea)

        ccg = phyui.session().show_correlograms(show=False).view
        self.create_view(ccg.native, "Correlograms", position=QtCore.Qt.LeftDockWidgetArea)

        # from PyQt4 import QtWebKit
        # wv = QtWebKit.QWebView()
        # wv.setUrl(QtCore.QUrl("http://localhost:8888"))
        # self.create_view(wv, "Clusters", position=QtCore.Qt.LeftDockWidgetArea)

        self.restore_geometry()

    def retranslateUi(self):
        self.setWindowTitle(QtGui.QApplication.translate("MainWindow", "Manual Clustering", None, QtGui.QApplication.UnicodeUTF8))


    # View methods.
    # -------------
    def create_view(self, view, title, position=None,
        closable=True, floatable=True, index=0, floating=None, **kwargs):
        """Add a widget to the main window."""

        # Create the dock widget.
        dockwidget = ViewDockWidget()
        #TODO: title is not a name
        dockwidget.setObjectName(title)
        dockwidget.setWidget(view)
        #dockwidget.closed.connect(self.dock_widget_closed)

        # Set dock widget options.
        options = QtGui.QDockWidget.DockWidgetMovable
        if closable:
            options = options | QtGui.QDockWidget.DockWidgetClosable
        if floatable:
            options = options | QtGui.QDockWidget.DockWidgetFloatable

        dockwidget.setFeatures(options)
        dockwidget.setAllowedAreas(
            QtCore.Qt.LeftDockWidgetArea |
            QtCore.Qt.RightDockWidgetArea |
            QtCore.Qt.TopDockWidgetArea |
            QtCore.Qt.BottomDockWidgetArea)

        #dockwidget.visibilityChanged.connect(partial(
        #    self.dock_visibility_changed_callback, view))

        if position is not None:
            # Add the dock widget to the main window.
            self.addDockWidget(position, dockwidget)

        if floating is not None:
            dockwidget.setFloating(floating)

        #dockwidget.setTitleBarWidget(DockTitleBar(dockwidget, title))
        dockwidget.setWindowTitle(title)

        # Return the dock widget.
        return dockwidget

        # Geometry.

    def save_geometry(self):
        """Save the arrangement of the whole window."""
        self.settings.setValue('state', self.saveState())
        self.settings.setValue('size', self.size())
        self.settings.setValue('pos', self.pos())

    def restore_geometry(self):
        """Restore the arrangement of the whole window."""
        self.restoreState(self.settings.value("state", QtCore.QByteArray()).toByteArray())
        self.resize(self.settings.value("size", QtCore.QSize(640, 480)).toSize())
        self.move(self.settings.value("pos", QtCore.QPoint(200, 200)).toPoint())


import sys

# test main
if __name__ == "__main__":
    qtapp = QtGui.QApplication(sys.argv)
    mySW = ManualClusteringMainWindow()
    mySW.show()
    ret = qtapp.exec_()
    mySW.save_geometry()
    sys.exit(ret)
