
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
    YOLO_model_name: Optional[str] = None
    target_image_size: Optional[int] = None
    epochs: Optional[int] = None
    batch_size: Optional[int] = None
    train_size_coeficient: Optional[float] = None

class TrainingBody(BaseModel):
    manifest: TrainingManifest
    hyperparameters: Hyperparameters

class InferenceManifest(BaseModel):
    model_uuid: str
    images: Dict[str, str]
    defects: Dict[str, str]

def merge_hyperparameters(incoming_hyperparameters) -> dict:
    result = {
        'fine_tune_YOLOv8': 0,
        'YOLO_model_name': 'yolov8n.pt',
        'target_image_size': 512,
        'epochs': 100,
        'batch_size': 16,
        'train_size_coeficient': 0.8
    }
    incoming_dict = incoming_hyperparameters.dict(exclude_unset=True)

    for key, value in incoming_dict.items():
        result[key] = value

    return result