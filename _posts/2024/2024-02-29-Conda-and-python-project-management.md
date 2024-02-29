---
layout: post
title: Conda and python project management
color: rgb(67, 176, 73)
tags: [python]
---

[Anaconda][2] is a python package distributor that comes with all the most used datascience packages included
in its full installation. 
But not all python developers are datascientists, and for the remaining which do not need all the datascience packages,
there is [miniconda][3], which is a light version of _Anaconda_ with only the minimum required packages. 

Both use the [conda package and environment manager][4], with the `conda` command, hence the shortcut with the name.
Because in this article we are taking a look at how _conda_ can be used within our python project management.

## Installation

Install [miniconda][1] on MacOS following the [instructions][1]:

```shell
mkdir -p ~/miniconda3
curl https://repo.anaconda.com/miniconda/Miniconda3-latest-MacOSX-arm64.sh -o ~/miniconda3/miniconda.sh
bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
rm -rf ~/miniconda3/miniconda.sh
```

Active it in your terminal using:

```shell
~/miniconda3/bin/conda init zsh
```

In this case I am using the `zsh` [interactive shell][11] find out how to install it and why you would use
it instead of the `bash` one in this [article][11].

## Get started

Now that you have conda install, you can start using it in your python project.

### From scratch

Let's assume you are starting from scratch, create a new virtual environment using:

```shell
conda create -n venv python=3.9
```

Now the environment is created, but not yet in use. Find the list of environment created with conda using:

```shell
conda info --envs 
# or 
conda env list

# conda environments:
#
base                  *  /Users/user/miniconda3
venv                     /Users/user/miniconda3/envs/venv
```

As you can see, the `venv` environment was created, but you are still on the default one.
The base one, is still different from the system one as it is also a virtual environment.
To switch to the created one use this command:

```shell
conda activate venv
```

And you should see on your terminal the command line prefix go from `(base)` to `(venv)`, 
which means you are now on the correct environment and ready to start.

### From an existing setup

You may have clone a repo that have already some dependencies attached to it,
and you would like to build the virtual environment automatically based on that.
Usually conda environments are saved with an `environment.yaml` file and it should look like:

```yaml
name: venv
dependencies:
  - python=3.9.18
  - numpy=1.16.4
  - pandas=0.24.2
```

If you identify such a file in the repository you can create the conda environment, then activate
the created environment using its name (defined in the file):

```shell
conda env create -f environment.yaml
conda activate <env name>
```

### Creating your conda environment

If there's just a `requirements.txt` without any conda files. You can still enable it in your project.

For that you can create a virtual environment and activate a conda environment as we've seen previously,
Then install all the dependencies `pip install -r requirements.txt` within the new environment.
Or you can use this command to do it for you:

```shell
conda create --name venv --file requirements.txt
```

And to save your environment as configuration file, use this command:

```shell
conda env export --name venv --file environment.yaml
```


It will create the `yaml` file for you from the requirements. At this point the `requirements.txt` becomes redundant.
It is better to limit duplication and have one source of truth regarding the dependencies of your project.

Though, I would suggest confirming the dependencies added in the `yaml` file as conda will add everything
installed to it. Some might not be necessarily explicitly needed.

## Useful commands

And now that you are set up with conda, here is a list of some of the command you may need to run
during the lifecycle of your python project.

- View installed packaged
    ```shell
    # By default the one installed in the current environment (use -n <env> to specify another)
    conda list
    ```            
- Update all the packages
    ```shell
    conda update --all
    ```
- Uninstall a specific package
    ```shell
    conda uninstall <package name>
    ```

You can also manage the [channels][5], which are urls where conda looks for packages and download them
from. The default channel is [repo.anaconda.com/pkgs/][6] and is managed by _Anaconda_, with some 
packages requiring licenses. The other one is `conda-forge` which is similar to `pypi`, you can add a channel with:

```shell
conda config --prepend channels conda-forge
```

And with that you should have enough information to get going!

## What's next

Now that you have your environment configured, that you know how to use conda, there's nothing much to do 
here on our side.
You are free to start coding, add dependencies and play within your newly conda managed python project.

We had talked about [managing your python environment][10] using pyenv [before][10], but with _conda_, 
one of the benefit is that you don't have to hold the virtual environment folder within the code.
Not that you would commit it. 

The other point worse mentioning is the export functionality to save your python environment which 
then can be committed and used by other developers as a working configuration.


[1]: https://docs.anaconda.com/free/miniconda/index.html 
[2]: https://docs.anaconda.com/
[3]: https://docs.anaconda.com/free/miniconda/?highlight=miniconda
[4]: https://docs.anaconda.com/free/distro-or-miniconda/
[5]: https://docs.conda.io/projects/conda/en/latest/user-guide/concepts/channels.html
[6]: https://repo.anaconda.com/pkgs/
[10]: {% post_url 2021/2021-05-19-Manage-your-python-environments %}
[11]: {% post_url 2021/2021-03-22-Mac-custom-terminal %}
