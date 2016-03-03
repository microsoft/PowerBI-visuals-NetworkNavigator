#!/usr/bin/env bash

#dot source the base shell script
. base.sh

set_defaults(){
    _set_defaults
#by default, default is set to yes. If any of the options are passed in, default is set to no.
    DEFAULT=YES
    DEBUG=NO
    BUILD=NO
    TEST=NO
    INSTALL=NO
    CLEAN=NO
    RUN=NO
    RUN_PARALLEL=NO
    WATCHER=NO
    SUDOREQUIRED=NO
    DOCKER=NO
    MACHINENAME=default
    CONTAINERNAME=thumbnails
    INSTALLDEPENDENCIES=NO
    GLOBAL=NO
    DOCKER=NO
    ENVIRONMENT=dev
    PUBLISH=NO
}

install_local_devTools(){
    _install_local_devTools
}
docker_init(){
    _docker_init
}

docker_create(){
    _docker_create
}

docker_start(){
    _docker_start
}

docker_attach(){
    _docker_attach
}

docker_bash(){
    _docker_bash
}

clean() {
    _clean
}

install_dependencies () {
    _install_dependencies
}

build(){
    if [[ $ENVIRONMENT = ci ]]; then
        echo "Running CI Build ... "

        if [ -d "/app/node_modules" ]; then
            echo "  Renaming node_modules to node_modules_bak ... "
            mv /app/node_modules /app/node_modules_bak
        fi

        echo "  Symlink pre-built node modules in parent directory... "
        ln -s /dependencies/node_modules/ /app/node_modules

        echo "  Running Build Tasks ... "
        node node_modules/gulp/bin/gulp sass scripts

        echo "  Unlinking node_module directory ..."
        rm /app/node_modules

        if [ -d "/app/node_modules_bak" ]; then
            echo "  Reverting node_modules_bak to node_modules ... "
            mv /app/node_modules_bak /app/node_modules
        fi
    elif [[ $DOCKER = NO ]]; then
        echo "Running Build Tasks ..."
        node node_modules/gulp/bin/gulp sass scripts
    else
        echo "Running Build Tasks in Docker ..."
        docker run -it --rm $CONTAINERNAME node node_modules/gulp/bin/gulp sass scripts
    fi
}

test (){
    if [[ $ENVIRONMENT = ci ]]; then
        echo "Running CI Tests ... "

        if [ -d "/app/node_modules" ]; then
            echo "  Renaming node_modules to node_modules_bak ... "
            mv /app/node_modules /app/node_modules_bak
        fi

        echo "  Symlink pre-built node modules in parent directory... "
        ln -s /dependencies/node_modules/ /app/node_modules

        echo "  Running Lint ... "
        node node_modules/gulp/bin/gulp lint

        echo "  Running Tests ... "
        node node_modules/gulp/bin/gulp test

        echo "  Unlinking and reverting original node_module directory ..."
        rm /app/node_modules

        if [ -d "/app/node_modules_bak" ]; then
            echo "  Reverting node_modules_bak to node_modules ... "
            mv /app/node_modules_bak /app/node_modules
        fi
    elif [[ $DOCKER = NO ]]; then
        echo "Running Tests ..."
        node node_modules/gulp/bin/gulp lint test
    else
        echo "Running Tests in Docker Container ... "
        docker run -it --rm $CONTAINERNAME node node_modules/gulp/bin/gulp lint test
    fi
}

run(){
    if [[ $DOCKER = NO ]]; then
        echo "Running Application ..."
        node node_modules/http-server/bin/http-server example -p 8082 -o
    else
        _docker_clean

        echo "Running Application in Docker ..."
        containerId=$(docker run -it -P -d $CONTAINERNAME node node_modules/http-server/bin/http-server example -p 8082)
        #echo "Container Id is $containerId)"
        echo "Machine is available at the following address:"
        ip=$(docker-machine ip $MACHINENAME)
        echo "          IP: $ip"
        echo $(docker port $containerId) | cut -d ":" -f 2 | while read port; do echo "          Port: $port"; done
    fi
}

publish(){
    if [[ $DOCKER = NO ]]; then
        echo "Publishing NPM Package ... "
        npm publish
    else
        echo "Running Tests in Docker Container ... "
        docker run -it --rm $CONTAINERNAME npm publish
    fi
}

watchers(){
    if [[ $DOCKER = NO ]]; then
        echo "Starting watchers ..."
        node node_modules/gulp/bin/gulp watch
    fi
}

help(){
    echo ""
    echo "================================================================"
    echo "                            USAGE                               "
    echo "================================================================"
    echo "Usage: sh thumbnails.sh [options: -h|-t|-g|-i|-d|-m]"
    echo ""
    echo "================================================================"
    echo "                           OPTIONS                              "
    echo "================================================================"
    echo ""
    echo "Default Mode: If no task parameters are passed in (docker param "
    echo "              excluded), install, build and test will be run.   "
    echo ""
    echo "-a|--all          Full Install"
    echo "-i|--install      Installs all project dependencies"
    echo "-b|--build        Builds the project"
    echo "-c|--clean        Clean Project depedencies"
    echo "-t|--test         Runs tests"
    echo "-g|--global       Installs development tools as global npm libraries"
    echo "-h|--help         Help File"
    echo "-r|--run          Run the Application"
    echo "-w|--watch        Start the watcher for file changes to rebuild"
    echo "-d|--docker       Dockerize the application. If the container is"
    echo "                  running, then attach to it. If not, create it"
    echo "-m|--machinename  Docker VM Name (default is \"default\")"
    echo "-db|--bash        Docker Bash"
    echo "--publish         NPM Publish package"
    echo ""
    echo " --- Environments --- "
    echo "--dev             Development environment (default)"
    echo "--ci              Continuous Integration environment"
    echo "================================================================"
}

#Set Default Values first.
set_defaults

for i in "$@"
do
case $i in
    -h|--help)
    HELP=YES
    DEFAULT=NO
    shift # past argument
    ;;
    -i|--install)
    INSTALLDEPENDENCIES=YES
    DEFAULT=NO
    shift # past argument
    ;;
    -g|--global)
    GLOBAL=YES
    SUDOREQUIRED=YES
    DEFAULT=NO
    shift # past argument
    ;;
    -b|--build)
    BUILD=YES
    DEFAULT=NO
    shift # past argument
    ;;
    -t|--test)
    TEST=YES
    DEFAULT=NO
    shift # past argument
    ;;
    -m|--machinename)
    MACHINENAME=$2
    shift
    ;;
    -d|--docker)
    DOCKER=YES
    DEFAULT=NO
    shift
    ;;
    -a|--all)
    INSTALLDEPENDENCIES=YES
    CLEAN=YES
    BUILD=YES
    TEST=YES
    RUN=YES
    DEFAULT=NO
    shift
    ;;
    --bash)
    DOCKER=YES
    BASH=YES
    DEFAULT=NO
    shift
    ;;
    -c|--clean)
    CLEAN=YES
    DEFAULT=NO
    shift
    ;;
    -r|--run)
    RUN=YES
    DEFAULT=NO
    shift
    ;;
    -w|--watch)
    RUN_PARALLEL=YES
    WATCHER=YES
    DEFAULT=NO
    ;;
    --debug)
    DEBUG=YES
    shift
    ;;
    --ci)
    ENVIRONMENT=ci
    DOCKERFILE=docker/Dockerfile.ci
    shift
    ;;
    --dev)
    ENVIRONMENT=dev
    DOCKERFILE=docker/Dockerfile.dev
    shift
    ;;
    --publish)
    PUBLISH=YES
    DEFAULT=NO
    shift
    ;;
esac
done

if [[ $DEBUG = YES ]]; then
    echo INSTALLDEPENDENCIES = "$INSTALLDEPENDENCIES"
    echo DEBUG = "$DEBUG"
    echo GLOBAL = "$GLOBAL"
    echo BUILD = "$BUILD"
    echo TEST= "$TEST"
    echo INSTALL = "$INSTALL"
    echo DOCKER = "$DOCKER"
    echo DEFAULT = "$DEFAULT"
    echo MACHINENAME = "$MACHINENAME"
    echo CONTAINERNAME = "$CONTAINERNAME"
    echo CLEAN = "$CLEAN"
    echo BASH = "$BASH"
    echo RUN = "$RUN"
    echo RUN_PARALLEL = "$RUN_PARALLEL"
    echo WATCHER = "$WATCHER"
    echo ENVIRONMENT = "$ENVIRONMENT"
    echo PUBLISH = "$PUBLISH"
fi

if [[ $SUDOREQUIRED = YES ]]; then
    checkRoot
fi

if [[ $HELP = YES ]]; then
    help
    exit;
fi

#initialize docker if dockermode is enabled.
if [[ $DOCKER = YES ]]; then
    docker_init
fi

if [[ $CLEAN = YES ]]; then
    clean
fi

#set defaults if default setting is set.
if [[ $DEFAULT = YES ]]; then
    INSTALLDEPENDENCIES=YES
    BUILD=YES
    TEST=YES
fi

if [[ $GLOBAL = YES ]]; then
    install_local_devTools
fi

if [[ $INSTALLDEPENDENCIES = YES ]]; then
    install_dependencies
fi

if [[ $BUILD = YES ]]; then
    build
fi

if [[ $TEST = YES ]]; then
    test
fi

if [[ $PUBLISH = YES ]]; then
    publish
fi

if [[ $BASH = YES ]]; then
    docker_bash
fi

if [[ $RUN = YES ]] && [[ $RUN_PARALLEL = NO ]]; then
    run
elif [[ $RUN = YES ]] && [[ $RUN_PARALLEL = YES ]]; then
    run &
fi

if [[ $WATCHER = YES ]]; then
    watchers
fi
