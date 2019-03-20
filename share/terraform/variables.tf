variable "infrastructure_name" {
  default = "antifragile-infrastructure"
}

variable "docker_repo" {}

variable "name" {
  default = "watch-rtp-play"
}

variable "version" {}

variable "aws_region" {
  default = "eu-west-1"
}

variable "api_keys" {
  type    = "list"
  default = [ ]
}
