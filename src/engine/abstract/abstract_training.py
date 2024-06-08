from abc import ABC, abstractmethod
import os

# base_dir = os.path.dirname(os.path.abspath(__file__))
# dataset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset')

# os.environ['BASE_DIR'] = base_dir
# os.environ['DATASET_DIR'] = dataset_dir


class TrainingEngine(ABC):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dataset')


    @abstractmethod
    def prepare_dataset(self):
        pass

    @abstractmethod
    def start_training(self):
        pass