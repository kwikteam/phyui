# phyui project

This project is the graphical user interface of the phy project. It's an UI for manual clustering.

You need IPython >= 3.0

## How to install
Install the IPython extension:

    python setup.py install

or if you want to develop and only create symlinks to your source directory:

    python setup.py develop

Install the IPython clustering sidebar by adding:

    // activate extensions only after Notebook is initialized
    require(["base/js/events"], function (events) {
        events.on("app_initialized.NotebookApp", function () {
        /*
         * all exentensions from IPython-notebook-extensions, uncomment to activate
         */

        // PUBLISHING
            IPython.load_extensions('phyui/notebook/clustering_sidebar')
        })
    });

at the end of ~/.ipython/profile_default/static/custom/custom.js
