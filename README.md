# phyui project

This project is the graphical user interface of the phy project. It's an UI for manual clustering.

You need IPython >= 3.0

## How to install
Install the IPython extension:
    python setup.py install

or if you want to develop and only create symlinks to your source directory:
    python setup.py develop

Install the IPython nbextension using:

    ipython install-nbextension --symlink static/phyui --user
