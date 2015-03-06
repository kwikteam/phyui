FLAKE8 ?= flake8
PYLINT ?= pylint2

help:
	@echo "clean - remove all build, test, coverage and Python artifacts"
	@echo "clean-build - remove build artifacts"
	@echo "clean-pyc - remove Python file artifacts"
	@echo "lint - check style with flake8"
	@echo "test - run tests quickly with the default Python"
	@echo "release - package and upload a release"
	@echo "dist - package"

clean: clean-build clean-pyc

clean-build:
	rm -fr build/
	rm -fr dist/
	rm -fr *.egg-info

clean-pyc:
	find . -name '*.pyc' -exec rm -f {} +
	find . -name '*.pyo' -exec rm -f {} +
	find . -name '*~' -exec rm -f {} +
	find . -name '__pycache__' -exec rm -fr {} +

lint:
	${FLAKE8} phyui --ignore=E226,E265,F401,F811

test: lint
	py.test --cov-report term-missing --cov phy

release: clean
	python setup.py sdist upload
	python setup.py bdist_wheel upload

dist: clean
	python setup.py sdist
	python setup.py bdist_wheel
	ls -l dist

pylint-full:
	@echo ":: Running pylint: phyui"
	@${PYLINT} --rcfile pylint.rc phyui 2>&1 || exit 1 || exit 0

pylint-error:
	@echo ":: Running pylint --errors-only: phyui"
	@${PYLINT} --errors-only --rcfile pylint.rc phyui 2>&1 || \
		exit 1 || exit 0
	@echo " => Checked only for pylint errors"
	@echo "    Use make check-all for running a full pylint check"
