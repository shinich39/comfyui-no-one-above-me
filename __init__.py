"""
@author: shinich39
@title: comfyui-no-one-above-me
@nickname: comfyui-no-one-above-me
@version: 1.0.0
@description: Fix node to top.
"""

from .nodes.node import NoOneAboveMe

NODE_CLASS_MAPPINGS = {
  "NoOneAboveMe": NoOneAboveMe,
}

NODE_DISPLAY_NAME_MAPPINGS = {
  "NoOneAboveMe": "No one above me",
}

WEB_DIRECTORY = "./js"

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]