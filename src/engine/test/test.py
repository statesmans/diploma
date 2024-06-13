
import numpy as np
import cv2
import os

# top_left_x = 11.555555555555555
# top_left_y = 4.444444444444445
# width = 965.3333333333334
# height = 248.88888888888889
# image_width = 1600
# image_height = 256

# # Calculate center coordinates
# center_x = top_left_x + (width / 2)
# center_y = top_left_y + (height / 2)

# # Normalize the center coordinates and dimensions
# center_x_normalized = center_x / image_width
# center_y_normalized = center_y / image_height
# width_normalized = width / image_width
# height_normalized = height / image_height

# yolo_format = (center_x_normalized, center_y_normalized, width_normalized, height_normalized)

# # Print the result
# print("YOLO format:", yolo_format)

def bbox_to_yolo_format(bbox, image_width, image_height, class_id=0):
    """
    Convert bounding box coordinates to YOLO format.

    Parameters:
    bbox (list): List containing [top_x, top_y, width, height].
    image_width (int): Width of the image.
    image_height (int): Height of the image.
    class_id (int): Class ID for the bounding box (default is 0).

    Returns:
    str: YOLO format string "class_id x_center_norm y_center_norm width_norm height_norm"
    """
    # Unpack the bounding box coordinates and dimensions
    top_x, top_y, width, height = bbox

    # Calculate center coordinates
    x_center = top_x + (width / 2)
    y_center = top_y + (height / 2)

    # Normalize coordinates
    x_center_norm = x_center / image_width
    y_center_norm = y_center / image_height
    width_norm = width / image_width
    height_norm = height / image_height

    # Return YOLO format string
    return f"{class_id} {x_center_norm} {y_center_norm} {width_norm} {height_norm}"

def yolo_to_bbox(yolo_bbox, img_width, img_height):
    # YOLO format: [class, x_center, y_center, width, height]
    x_center, y_center, width, height = yolo_bbox
    print(x_center, y_center, width, height)
    # Convert from YOLO format to bounding box coordinates
    top_left_x = int((x_center - width / 2) * img_width)
    top_left_y = int((y_center - height / 2) * img_height)
    bbox_width = int(width * img_width)
    bbox_height = int(height * img_height)

    return top_left_x, top_left_y, bbox_width, bbox_height


def augment_and_resize(image_path, bbox, target_size=512):
    # Read the image
    image = cv2.imread(image_path)
    
    # Define the augmentation pipeline
    transform = A.Compose([
        A.HorizontalFlip(p=0.5),
        A.Resize(target_size, target_size)
    ], bbox_params=A.BboxParams(format='yolo', label_fields=['class_labels']))

    # Apply the transformations
    transformed = transform(image=image, bboxes=[bbox], class_labels=['object'])

    # Extract the transformed image and bbox
    transformed_image = transformed['image']
    transformed_bbox = transformed['bboxes'][0]

    return transformed_image, transformed_bbox

def draw_yolo_boxes(image_path, labels_path, output_path):
    # Load the image
    image = cv2.imread(image_path)
    img_height, img_width = image.shape[:2]

    # Load the labels
    with open(labels_path, 'r') as file:
        lines = file.readlines()
        print(lines)
        for line in lines:
            
            parts = line.strip().split()
            # class_id = int(parts[0])
            yolo_bbox = list(map(float, parts))
            print('0', yolo_to_bbox(yolo_bbox, img_width, img_height))

            top_left_x, top_left_y, bbox_width, bbox_height = yolo_bbox
            print('1',  top_left_x, top_left_y, bbox_width, bbox_height)
            # Draw the rectangle on the image
            top_left_x = int(top_left_x)
            top_left_y = int(top_left_y)
            bbox_width = int(bbox_width)
            bbox_height = int(bbox_height)
            print('2', top_left_x, top_left_y, bbox_width, bbox_height)

            top_left_x_int = int(top_left_x)
            top_left_y_int = int(top_left_y)
            bbox_width_int = int(bbox_width)
            bbox_height_int = int(bbox_height)
            print('3', top_left_x_int, top_left_y_int, bbox_width_int, bbox_height_int)

            # Draw the rectangle on the image
            cv2.rectangle(image, (195, 215), 
              (195 + 315, 215 + 81), (0, 255, 0), 2)
            # Draw the rectangle
            # cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

    # Save the output image
    cv2.imwrite(output_path, image)

# Example usage
image_path = f"{os.path.dirname(os.path.abspath(__file__))}/d4bb706c-4561-451a-8ca9-25b8fd669cb4.jpg"
labels_path = f"{os.path.dirname(os.path.abspath(__file__))}/4c580d36-306f-4370-bee1-b700d79e4e9a.txt"
output_path = f"{os.path.dirname(os.path.abspath(__file__))}/result.jpg"
draw_yolo_boxes(image_path, labels_path, output_path)

# augment_and_resize(image_path, )



# def crop_and_save_image(image, labels, crop_size, output_dir, image_name):
#     h, w = image.shape[:2]
#     crop_h, crop_w = crop_size

#     for i in range(0, h, crop_h):
#         for j in range(0, w, crop_w):
#             crop_img = image[i:i + crop_h, j:j + crop_w]
#             if crop_img.shape[0] < crop_h or crop_img.shape[1] < crop_w:
#                 continue

#             crop_labels = []
#             for label in labels:
#                 class_id, x_center, y_center, width, height = label
#                 abs_x_center = x_center * w
#                 abs_y_center = y_center * h
#                 abs_width = width * w
#                 abs_height = height * h

#                 x_min = abs_x_center - abs_width / 2
#                 x_max = abs_x_center + abs_width / 2
#                 y_min = abs_y_center - abs_height / 2
#                 y_max = abs_y_center + abs_height / 2

#                 crop_x_min = max(x_min, j)
#                 crop_y_min = max(y_min, i)
#                 crop_x_max = min(x_max, j + crop_w)
#                 crop_y_max = min(y_max, i + crop_h)

#                 if crop_x_min < crop_x_max and crop_y_min < crop_y_max:
#                     new_x_center = ((crop_x_min + crop_x_max) / 2 - j) / crop_w
#                     new_y_center = ((crop_y_min + crop_y_max) / 2 - i) / crop_h
#                     new_width = (crop_x_max - crop_x_min) / crop_w
#                     new_height = (crop_y_max - crop_y_min) / crop_h

#                     crop_labels.append([
#                         class_id,
#                         new_x_center,
#                         new_y_center,
#                         new_width,
#                         new_height
#                     ])

#             if crop_labels:
#                 crop_img_name = f"{image_name}_{i}_{j}.jpg"
#                 cv2.imwrite(os.path.join(output_dir, crop_img_name), crop_img)
#                 with open(os.path.join(output_dir, crop_img_name.replace('.jpg', '.txt')), 'w') as f:
#                     for crop_label in crop_labels:
#                         f.write(" ".join(map(str, crop_label)) + '\n')

# def process_images(input_dir, output_dir, crop_size=(50, 50)):
#     if not os.path.exists(output_dir):
#         os.makedirs(output_dir)


#     image_path = f"{os.path.dirname(os.path.abspath(__file__))}/7160c6b8-fbce-4a5f-a8c6-d68cfc32835f.jpg"
#     label_path = f"{os.path.dirname(os.path.abspath(__file__))}/7160c6b8-fbce-4a5f-a8c6-d68cfc32835f.txt"

    
#     image = cv2.imread(image_path)
#     with open(label_path, 'r') as f:
#         labels = [list(map(float, line.strip().split())) for line in f.readlines()]
    
#     image_name = '7160c6b8-fbce-4a5f-a8c6-d68cfc32835f'
#     crop_and_save_image(image, labels, crop_size, output_dir, image_name)


# if __name__ == "__main__":
#     input_directory = "path_to_input_images"
#     output_directory = f"{os.path.dirname(os.path.abspath(__file__))}/cropped"
#     preferred_crop_size = (512, 512)  # Replace with your preferred dimensions

#     process_images(input_directory, output_directory, preferred_crop_size)


# def crop_and_pad_image(image_path, label, target_size=512, padding_color=(0, 0, 0)):
#     # Load the image
#     image = cv2.imread(image_path)
#     height, width, _ = image.shape

#     # Parse the YOLO label
#     class_id, x_center, y_center, w, h = map(float, label.strip().split())

#     # Convert YOLO format to bounding box coordinates
#     x_center, y_center, w, h = x_center * width, y_center * height, w * width, h * height
#     x1, y1 = int(x_center - w / 2), int(y_center - h / 2)
#     x2, y2 = int(x_center + w / 2), int(y_center + h / 2)

#     # Crop the image using the bounding box
#     cropped_image = image[y1:y2, x1:x2]

#     # Resize the cropped image to the target size
#     resized_image = cv2.resize(cropped_image, (target_size, target_size))

#     # Calculate padding
#     pad_top = (target_size - resized_image.shape[0]) // 2
#     pad_bottom = target_size - resized_image.shape[0] - pad_top
#     pad_left = (target_size - resized_image.shape[1]) // 2
#     pad_right = target_size - resized_image.shape[1] - pad_left

#     # Add padding to the resized image
#     padded_image = cv2.copyMakeBorder(
#         resized_image, pad_top, pad_bottom, pad_left, pad_right,
#         cv2.BORDER_CONSTANT, value=padding_color
#     )

#     return padded_image

# # Example usage
# image_path = f"/home/yegor/diploma/src/engine/dataset/images/val/color_crack/7160c6b8-fbce-4a5f-a8c6-d68cfc32835f.jpg"
# label = '0 0.14722222222222223 0.024305555555555556 0.26333333333333336 0.9513888888888888'
# target_size = 512
# padding_color = (128, 128, 128)  # Using a gray color for padding

# output_image = crop_and_pad_image(image_path, label, target_size, padding_color)
# cv2.imwrite(f"{os.path.dirname(os.path.abspath(__file__))}/cropped/test.jpg", output_image)

# import cv2

# def crop_and_pad_image(image_path, label, target_size=512, padding_color=(0, 0, 0)):
#     # Load the image
#     image = cv2.imread(image_path)
#     height, width, _ = image.shape
#     print(f"Image path: {image_path}")
#     print(f"Image size: {image.size}, height: {height}, width: {width}")
    
#     # # Parse the YOLO label
#     # class_id, x_center, y_center, w, h = map(float, label.strip().split())
#     # print(f"Parsed label - class_id: {class_id}, x_center: {x_center}, y_center: {y_center}, width: {w}, height: {h}")
#     print(label)
#     top_left_x = 248.88888888888889
#     top_left_y  = 21.333333333333332
#     label_width = 400
#     label_height = 197.33333333333331
    

#     x1, y1 = top_left_x, top_left_y
#     x2, y2 = top_left_x + label_width, top_left_y + label_height
#     # Crop the image using the bounding box
#     cropped_image = image[y1:y2, x1:x2]


#     print(f"Cropped image size: {cropped_image.shape if cropped_image.size != 0 else 'empty'}")

#     if cropped_image.size == 0:
#         raise ValueError(f"Cropped image is empty. Check the bounding box coordinates and image size for image: {image_path}")

#     # Resize the cropped image to the target size
#     resized_image = cv2.resize(cropped_image, (target_size, target_size))

#     # Calculate padding
#     pad_top = (target_size - resized_image.shape[0]) // 2
#     pad_bottom = target_size - resized_image.shape[0] - pad_top
#     pad_left = (target_size - resized_image.shape[1]) // 2
#     pad_right = target_size - resized_image.shape[1] - pad_left

#     # Add padding to the resized image
#     padded_image = cv2.copyMakeBorder(
#         resized_image, pad_top, pad_bottom, pad_left, pad_right,
#         cv2.BORDER_CONSTANT, value=padding_color
#     )

#     return padded_image

# # Example usage
# image_path = '/home/yegor/diploma/src/engine/dataset/images/val/color_crack/7160c6b8-fbce-4a5f-a8c6-d68cfc32835f.jpg'
# label = '0 248.88888888888889 21.333333333333332 400 197.33333333333331'  # Example YOLO label format

# try:
#     padded_image = crop_and_pad_image(image_path, label)
#     print("Image processed successfully")
# except ValueError as e:
#     print(e)
# except cv2.error as e:
#     print(f"OpenCV error: {e}")


# import torch
# from ultralytics import YOLO
# # Load your trained YOLOv8 model
# model = YOLO('/home/yegor/diploma/runs/detect/train14/weights/best.pt')  # Replace with the path to your model
# import cv2
# # Function to run inference on an image
# def run_inference(image_path):    # Load the image using OpenCV
#     image = cv2.imread(image_path)
#     if image is None:
#         print(f"Failed to load image at {image_path}")
#         return

#     # Convert the image from BGR to RGB format
#     image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

#     # Run inference
#     results = model(image_rgb)

#     # Process results
#     for result in results:
#         print(f"Detected {len(result.boxes)} objects in the image.")
#         for box in result.boxes:
#             # YOLOv8 returns results in a specific format
#             xyxy = box.xyxy[0].cpu().numpy()  # Get the bounding box coordinates
#             confidence = box.conf[0].cpu().numpy()  # Get the confidence score
#             cls = box.cls[0].cpu().numpy()  # Get the class label

#             print(f"Class: {cls}, Confidence: {confidence}, Bounding box: {xyxy}")

#             # Extract coordinates
#             x1, y1, x2, y2 = map(int, xyxy)

#             # Crop the detected object (bounding box)
#             cropped_image = image[y1:y2, x1:x2]
#             print('cropped')
#             # Save or display the cropped image
#             # For example, you can save it using OpenCV:
#             cv2.imwrite(f'{os.path.dirname(os.path.abspath(__file__))}/cropped_.jpg', cropped_image)
#             # Or display it using matplotlib:
#             # import matplotlib.pyplot as plt
#             # plt.imshow(cv2.cvtColor(cropped_image, cv2.COLOR_BGR2RGB))
#             # plt.show()

# # Example usage
# run_inference(f'{os.path.dirname(os.path.abspath(__file__))}/7160c6b8-fbce-4a5f-a8c6-d68cfc32835f.jpg')  # Replace with the path to your image