
size = int(input("size: "))
while(True):

    value = float(input("num: "))
    if (size < 2):
        print((float(value) * 1.75))
    else:
        value = float(value)
        for _ in range(int(size) - 1):
           value *= 1.75
    
        print(float(value)) 
   

        
