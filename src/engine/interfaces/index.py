
from pydantic import BaseModel
from typing import Dict, Sequence, Literal, Optional

class Label(BaseModel):
    label_data: str
    defect_id: int

class TrainingManifest(BaseModel):
    model_uuid: str
    defects: Dict[str, str]
    images: Dict[str, str]
    labels: Dict[str, Label]

class Hyperparameters(BaseModel):
    fine_tune_YOLOv8: Optional[Literal[0, 1]] = None

class TrainingBody(BaseModel):
    manifest: TrainingManifest
    hyperparameters: Hyperparameters

class InferenceManifest(BaseModel):
    model_uuid: str
    images: Dict[str, str]
    defects: Dict[str, str]