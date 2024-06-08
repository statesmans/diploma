import cv2
import numpy as np
import os

def draw_yolo_boxes(image_path, labels_path, output_path):
    # Load the image
    image = cv2.imread(image_path)
    height, width, _ = image.shape

    # Load the labels
    with open(labels_path, 'r') as file:
        lines = file.readlines()
    print(lines)
    for line in lines:
        class_id, x_center, y_center, w, h = map(float, line.strip().split())

        # Convert YOLO format to bounding box coordinates
        x_center, y_center, w, h = x_center * width, y_center * height, w * width, h * height
        x1, y1 = int(x_center - w / 2), int(y_center - h / 2)
        x2, y2 = int(x_center + w / 2), int(y_center + h / 2)
        print(image.shape)
        # Draw the rectangle
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

    # Save the output image
    cv2.imwrite(output_path, image)

# Example usage
image_path = f"{os.path.dirname(os.path.abspath(__file__))}/18ef5e6f6.jpg"
labels_path = f"{os.path.dirname(os.path.abspath(__file__))}/18ef5e6f6.txt"
output_path = f"{os.path.dirname(os.path.abspath(__file__))}/result.jpg"
draw_yolo_boxes(image_path, labels_path, output_path)