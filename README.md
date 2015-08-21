open terminal / cmd 

go to desired location 

git clone https://github.com/Arkhh/niceHashScript.git

cd niceHashScript 

npm start

go to localhost:8000

to edit the default value for API infos or MaxHash and MinHash go to => /app/scripts/controllers/mainController.js

Open with notepad++ or equivalent.

Edit the apiKey, niceHashId, location, algo with the values that you want.

       $scope.infos = {
            apiKey: '12b2e6a0-0358-4d23-af63-41e86733c7cb',
            niceHashID: '19336',
            location: '0',
            algo: '3'
        };
		
Same here with the default max & min Hash ( it's the max & min hash for every algo since it only supports one algo.)
		
        $scope.maxHash={X11:0.35}; // max hash value for X11
        $scope.minHash={X11:0.05}; // min hash value for X11

enjoy ;) 