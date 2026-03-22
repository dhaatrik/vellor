from PIL import Image

def test():
    img = Image.open('students.png')
    print("Students Image Size:", img.size)

if __name__ == '__main__':
    test()
