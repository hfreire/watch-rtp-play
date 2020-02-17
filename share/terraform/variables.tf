variable "infrastructure_name" {
  default = "antifragile-infrastructure"
}

variable "docker_repo" {
}

variable "docker_image_tag" {
}

variable "name" {
  default = "watch-rtp-play"
}

variable "aws_region" {
  default = "eu-west-1"
}

variable "api_keys" {
  type    = list(string)
  default = [ ]
}

variable "log_level" {
  default = "debug"
}
