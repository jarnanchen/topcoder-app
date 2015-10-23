(function () {
  'use strict';

  angular.module('tc.myDashboard').controller('MyChallengesWidgetController', MyChallengesWidgetController);

  MyChallengesWidgetController.$inject = ['ChallengeService', 'UserService', '$log', 'CONSTANTS', 'userIdentity', '$q'];

  function MyChallengesWidgetController(ChallengeService, UserService, $log, CONSTANTS, userIdentity, $q) {
    var vm = this;
    vm.domain = CONSTANTS.domain;
    vm.neverParticipated = false;
    vm.loading = true;
    vm.userHasChallenges = true;
    vm.challengeView = 'tile';
    vm.toggleView = toggleView;

    var handle = userIdentity.handle;

    activate();

    function activate() {
      vm.myChallenges = [];
      _checkForParticipation().then(function() {
        getChallenges();
      });
    }

    function getChallenges() {
      var marathonMatchParams = {
        limit: 8,
        filter: 'status=active'
      };

      var challengeParams = {
        limit: 8,
        orderBy: 'submissionEndDate',
        filter: 'status=active'
      };

      $q.all([
        ChallengeService.getUserMarathonMatches(handle, marathonMatchParams),
        ChallengeService.getUserChallenges(handle, challengeParams)
      ]).then(function(challenges){
        console.log('challenges: ', challenges);
        var marathonMatches = challenges[0];
        var devDesignChallenges = challenges[1];

        if (!marathonMatches.length && !devDesignChallenges.length) {
          vm.userHasChallenges = false;
          vm.loading = false;

        } else {
          ChallengeService.processActiveDevDesignChallenges(devDesignChallenges);
          ChallengeService.processActiveMarathonMatches(marathonMatches);
          var userChallenges = marathonMatches.concat(devDesignChallenges);

          userChallenges = _.sortBy(userChallenges, function(n) {
            return n.registrationEndDate
          });
          vm.myChallenges = userChallenges.reverse().slice(0, 8);
          vm.userHasChallenges = true;
          vm.loading = false;
        }
      })
      .catch(function(err) {
        $log.error(err);
        vm.userHasChallenges = true;
        vm.loading = false;
      });
    }

    function toggleView(view) {
      if (vm.challengeView !== view) {
        vm.challengeView = view;
      }
    }

    function _checkForParticipation() {
      var params = {
        limit: 1,
        offset: 0
      };
      return ChallengeService.getUserChallenges(handle, params).then(function(challenges) {
        if (challenges.metadata.totalCount > 0) {
          vm.neverParticipated = true;
        } else {
          vm.neverParticipated = true;
        }
      });
    }
  }
})();
