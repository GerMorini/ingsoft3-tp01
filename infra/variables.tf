variable "image_repo_api" {
  description = "Repositorio público de la imagen del backend."
  type        = string
  default     = "ghcr.io/germorini/ingsoft3-tp01-backend"
}

variable "image_repo_front" {
  description = "Repositorio público de la imagen del frontend."
  type        = string
  default     = "ghcr.io/germorini/ingsoft3-tp01-frontend"
}

variable "image_tag" {
  description = "Etiqueta inmutable publicada al cerrar el TP7."
  type        = string
  default     = "sha-53880d3ccffdd2e8db5a70e5b75e9b8b8b63e21f"

  validation {
    condition     = can(regex("^sha-[0-9a-f]{40}$", var.image_tag))
    error_message = "image_tag debe tener el formato sha- seguido por 40 caracteres hexadecimales."
  }
}

variable "region" {
  description = "Región de los servicios de preprod en Render."
  type        = string
  default     = "ohio"
}

variable "neon_org_id" {
  description = "Organización donde se crea el proyecto Neon de preprod."
  type        = string
  default     = "org-late-dew-51506638"
}
