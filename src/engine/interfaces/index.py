
from pydantic import BaseModel
from typing import Dict, Sequence, Literal, Optional

class Label(BaseModel):
    label_data: str
    defect_id: int

class Manifest(BaseModel):
    defect_ids: Sequence[int]
    images: Dict[str, str]
    labels: Dict[str, Label]

class Hyperparameters(BaseModel):
    fine_tune_YOLOv8: Optional[Literal[0, 1]] = None

class TrainingBody(BaseModel):
    manifest: Manifest
    hyperparameters: Hyperparameters