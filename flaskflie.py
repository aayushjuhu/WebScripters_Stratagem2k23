from flask import Flask, request
import face_recognition
import cv2
app = Flask(__name__)

@app.route('/upload-photo', methods=['POST'])
def upload_photo():
    photo = request.files.get('photo')
    if not photo:
        return 'No photo provided', 400

    # Save photo to disk (optional)
    photo[0].save('phot1.jpg')
    photo[1].save('phot2.jpg')
   

#Load the images containing faces
    image1 = face_recognition.load_image_file("./phot2.jpg")
    image2 = face_recognition.load_image_file("./phot1.jpg")

    # #Locate the faces in the images
    face_locations1 = face_recognition.face_locations(image1)
    face_locations2 = face_recognition.face_locations(image2)

    # #Encode the faces
    face_encodings1 = face_recognition.face_encodings(image1, face_locations1)
    face_encodings2 = face_recognition.face_encodings(image2, face_locations2)

    # #Compare the face encodings using a distance metric
    match_found = False
    for face_encoding1 in face_encodings1:
        for face_encoding2 in face_encodings2:
            results = face_recognition.compare_faces([face_encoding1], face_encoding2)
            if results[0] == True:
                match_found = True
                return("Match found!",200)
                break
        if match_found:
            break
    if not match_found:
        return("Match not found",400)

    # Process the photo (optional)
    # ...

    # return 'Photo received', 200

if __name__ == '__main__':
    app.run(port=5000)