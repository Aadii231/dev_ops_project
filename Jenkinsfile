pipeline {
    agent any

    environment {
        DOCKER_USERNAME = 'adnanshakeel231'
        FRONTEND_IMAGE  = 'adnanshakeel231/frontend'
        BACKEND_IMAGE   = 'adnanshakeel231/backend'
        VERSION_TAG     = "v1.${env.BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Push Backend') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    sh "echo $DH_PASS | docker login -u $DH_USER --password-stdin"
                    sh "docker build -t ${BACKEND_IMAGE}:${VERSION_TAG} -t ${BACKEND_IMAGE}:latest ./server"
                    sh "docker push ${BACKEND_IMAGE}:${VERSION_TAG}"
                    sh "docker push ${BACKEND_IMAGE}:latest"
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DH_USER',
                    passwordVariable: 'DH_PASS'
                )]) {
                    sh "docker build -t ${FRONTEND_IMAGE}:${VERSION_TAG} -t ${FRONTEND_IMAGE}:latest ./client"
                    sh "docker push ${FRONTEND_IMAGE}:${VERSION_TAG}"
                    sh "docker push ${FRONTEND_IMAGE}:latest"
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(credentialsId: 'app-ec2-ssh-key', keyFileVariable: 'SSH_KEY'),
                    string(credentialsId: 'app-ec2-host', variable: 'EC2_HOST')
                ]) {
                    sh """
                        ssh -o StrictHostKeyChecking=no -i \$SSH_KEY ubuntu@\$EC2_HOST '
                            cd ~
                            if [ ! -d "dev_ops_project" ]; then
                                git clone https://github.com/Aadii231/dev_ops_project.git
                            fi
                            cd ~/dev_ops_project
                            git fetch origin main
                            git reset --hard origin/main
                            sed -i "s/\\\${VERSION_TAG:-v1.0}/latest/g" docker-compose.yml
                            sed -i "s/\\\${VERSION_TAG}/latest/g" docker-compose.yml
                            docker compose down --remove-orphans
                            docker compose pull
                            docker compose up -d --force-recreate
                            docker compose ps
                        '
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded — version ${VERSION_TAG} deployed."
        }
        failure {
            echo "Pipeline failed — check stage logs above."
        }
    }
}