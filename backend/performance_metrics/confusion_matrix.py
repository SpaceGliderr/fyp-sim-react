import cv2
from sklearn.metrics import classification_report, confusion_matrix

def generate_confusion_matrix():
    """
    Generate a confusion matrix for the mapping algorithm
    """
    ground_truth_dir = "./mapping/"
    prefix = ["M1-S-", "M2-M-", "M3-L-"]
    file_format = ".png"
    
    for i in range(0, len(prefix)):
        ground_truth = cv2.imread(f'{ground_truth_dir}{prefix[i]}GT{file_format}', cv2.IMREAD_GRAYSCALE)
        _, gt_thresh = cv2.threshold(ground_truth, 200, 255, cv2.THRESH_BINARY)

        original = cv2.imread(f'{ground_truth_dir}{prefix[i]}original{file_format}', cv2.IMREAD_GRAYSCALE)
        _, ori_thresh = cv2.threshold(original, 200, 255, cv2.THRESH_BINARY)

        morph_applied = cv2.imread(f'{ground_truth_dir}{prefix[i]}opening{file_format}', cv2.IMREAD_GRAYSCALE)
        _, morph_thresh = cv2.threshold(morph_applied, 200, 255, cv2.THRESH_BINARY)


        # Calculate confusion matrix
        # print(confusion_matrix(ground_truth.flatten(), original.flatten()).ravel())
        # print(classification_report(gt_thresh.flatten(), ori_thresh.flatten()))

        otn, ofp, ofn, otp = confusion_matrix(gt_thresh.flatten(), ori_thresh.flatten(), labels=[0, 255]).ravel()
        mtn, mfp, mfn, mtp = confusion_matrix(gt_thresh.flatten(), morph_thresh.flatten(), labels=[0, 255]).ravel()

        ori_classification_report = classification_report(gt_thresh.flatten(), ori_thresh.flatten(), labels=[0, 255])
        morph_classification_report = classification_report(gt_thresh.flatten(), morph_thresh.flatten(), labels=[0, 255])

        # Print results
        print(f'Map {i + 1}')
        print(confusion_matrix(gt_thresh.flatten(), ori_thresh.flatten(), labels=[0, 255]))
        print(confusion_matrix(gt_thresh.flatten(), morph_thresh.flatten(), labels=[0, 255]))
        print(f'Original Map Confusion Matrix\nTN: {otn}\nFP: {ofp}\nFN: {ofn}\nTP: {otp}\n')
        print(f'Morph Map Confusion Matrix\nTN: {mtn}\nFP: {mfp}\nFN: {mfn}\nTP: {mtp}\n')
        print("Original Map Classification Report\n", ori_classification_report)
        print("Morph Map Classification Report\n", morph_classification_report)


if __name__ == "__main__":
    generate_confusion_matrix()
