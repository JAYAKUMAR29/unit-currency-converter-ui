terraform {
  required_version = ">= 1.0"
}

resource "local_file" "project_info" {
  filename = "project-info.txt"
  content  = "Unit and Currency Converter - DevOps Project"
}