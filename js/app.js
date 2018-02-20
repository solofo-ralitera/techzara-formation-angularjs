String.guid = function() {
    function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    }
    return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
};

const app = angular.module("app", []);

app.filter('age', function() {
    return function(birth) {
        return new Date().getFullYear() - new Date(birth).getFullYear();
    };
});
app.service('scopeService', function() {
    return {
        safeApply: function ($scope, fn) {
            var phase = $scope.$root.$$phase;
            if (phase === '$apply' || phase === '$digest') {
                if (fn && typeof fn === 'function') {
                    fn();
                }
            } else {
                $scope.$apply(fn);
            }
        },
    };
});
app.controller("appCtrl", function($rootScope, $scope, $interval, scopeService){
    $scope.title = "Vue.js Getting Started";
    $scope.counter = 0;
    $scope.members = [];
    $scope.userForm = {
        guid: null,
        nom: '',
        prenom: '',
        birth : null,
        tel : null,
        email : '',
        adresse : ''
    };

    $scope.init = function() {
        console.log(1);
        // Init firebase
        firebase.initializeApp({
            apiKey: "AIzaSyC8hI-mObh6_zC4CHCsErTcfSu3msojp4o",
            authDomain: "formation-tz.firebaseapp.com",
            databaseURL: "https://formation-tz.firebaseio.com",
            projectId: "formation-tz",
            storageBucket: "",
            messagingSenderId: "604798803445"
        });
        $scope.database = firebase.database();

        // Listeners to /members
        $scope.database.ref('members').on('value', snapshot => {
            scopeService.safeApply($rootScope, () => $scope.members = snapshot.val());
        });
    };

    $scope.startCounter = function() {
        $scope.timer = $interval(() => ++$scope.counter, 1000);
    };

    $scope.stopCounter = function() {
        $scope.counter = 0;
        if($scope.timer) $interval.cancel($scope.timer);
    };

    // Init or Reset form
    $scope.resetUserForm = function() {
        $scope.userForm = {
            guid: null,
            nom: '',
            prenom: '',
            birth : null,
            tel : null,
            email : '',
            adresse : ''
        }
    };

    $scope.addMember = function() {
        if($scope.userForm.nom === '') return;

        // Transform to date string, due to input type = date
        if($scope.userForm.birth && typeof $scope.userForm.birth === 'object') $scope.userForm.birth = $scope.userForm.birth.toISOString().split('T')[0];

        $scope.database.ref('members/' + ($scope.userForm.guid? $scope.userForm.guid : String.guid())).set($scope.userForm);
        // Reset form
        $scope.resetUserForm();
    };

    $scope.editMember = function(guid, member) {
        // Transform to date object, due to input type = date
        if(member.birth) member.birth = new Date(member.birth);

        $scope.userForm = member;
        $scope.userForm.guid = guid;
    };

    $scope.removeMember = function (guid) {
        $scope.database.ref('members/' + guid).remove();
        // Reset form
        $scope.resetUserForm();
    };

});