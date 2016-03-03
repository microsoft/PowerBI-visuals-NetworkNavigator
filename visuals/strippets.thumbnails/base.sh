#!/usr/bin/env bash
_set_defaults(){
    DOCKER=NO
    MACHINENAME=default
    CONTAINERNAME=default
}

checkRoot(){
    ROOT_UID="0"
    #Check if run as root
    if [ "$UID" -ne "$ROOT_UID" ] ; then
        echo "You must be root to run this command. Re-run the command using sudo."
        exit 1
    fi
}
# ========== DOCKER ===========
_docker_init(){
    echo "Building Docker Image on machine: $MACHINENAME... "
    status=$(docker-machine status $MACHINENAME)
    echo "Machine ($MACHINENAME) Status: $status"
    if [[ $status = "Running" ]]; then
        docker_attach
    elif [[ $status = "Stopped" ]]; then
        docker_start
    elif [[ $status = "Error" ]]; then
        echo "An error has occured. ($MACHINENAME) is in an error state."
        exit 1;
    elif [[ $status == *"Host does not exist"* || $status = "" ]]; then
        docker_create
    fi
}

_docker_create(){
    echo "Creating a new docker machine using Virtualbox: $MACHINENAME"
    docker-machine create --driver virtualbox $MACHINENAME
    docker_start
}

_docker_start(){
    echo "Starting docker machine: $MACHINENAME"
    docker-machine start $MACHINENAME
    docker_attach
}

_docker_attach(){
    echo "Attaching client to docker machine: $MACHINENAME"
    docker_attach_cmd=$(echo $(docker-machine env $MACHINENAME) | sed -E 's/.*# (eval.*)$/\1/')
    #eval the eval :)
    eval $docker_attach_cmd
}

_docker_bash(){
    docker run -it --rm $CONTAINERNAME bash
}

_docker_clean(){
    echo "Stopping and removing old applications from Docker ... "
    docker rm -f $(docker ps -a -f IMAGE=$CONTAINERNAME -q)
}
_clean() {
    if [[ $DOCKER = NO ]]; then
        echo "Cleaning Project Dependencies ... "
        rm -rf node_modules
    fi
}

_install_dependencies () {
    if [[ $DOCKER = NO ]]; then
        echo "Installing Project Dependencies"
        npm install
    else
        echo "Building Docker Container ..."
        docker build -t $CONTAINERNAME .
    fi
}

# ========== TOOLS ===========

_install_local_devTools() {
    echo "Installing Local Development Tools"
    npm install -g nvm
    npm install -g gulp
    npm install -g mocha
    npm install -g karma-cli
    npm install -g bower
}