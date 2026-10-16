terraform {
  required_version = ">= 1.5"

  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "0.18.0"
    }
    render = {
      source  = "render-oss/render"
      version = "1.9.1"
    }
  }
}

provider "neon" {}
provider "render" {}

resource "neon_project" "preprod" {
  name                      = "fitpro-germorini-preprod"
  org_id                    = var.neon_org_id
  history_retention_seconds = 21600
}

resource "neon_role" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "fitpro_preprod_owner"
}

resource "neon_database" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "fitpro_preprod"
  owner_name = neon_role.preprod.name
}

locals {
  database_url = "postgresql://${urlencode(neon_role.preprod.name)}:${urlencode(neon_role.preprod.password)}@${neon_project.preprod.database_host}/${urlencode(neon_database.preprod.name)}?sslmode=require"
}

resource "render_web_service" "api" {
  name              = "fitpro-germorini-api-preprod"
  plan              = "free"
  region            = var.region
  health_check_path = "/health"

  runtime_source = {
    image = {
      image_url = var.image_repo_api
      tag       = var.image_tag
    }
  }

  env_vars = {
    DATABASE_URL = { value = local.database_url }
    HTTP_ADDR    = { value = "0.0.0.0:8080" }
    JWT_SECRET   = { generate_value = true }
  }
}

resource "render_web_service" "front" {
  name              = "fitpro-germorini-front-preprod"
  plan              = "free"
  region            = var.region
  health_check_path = "/"

  runtime_source = {
    image = {
      image_url = var.image_repo_front
      tag       = var.image_tag
    }
  }

  env_vars = {
    BACKEND_URL  = { value = trimsuffix(render_web_service.api.url, "/") }
    DNS_RESOLVER = { value = "8.8.8.8" }
  }
}
