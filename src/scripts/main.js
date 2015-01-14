var consumerKey = '9994e3c432c77379bee441c98b1a4082';
var host = 'https://api.soundcloud.com';
var trackID = 165098282;
var magnitude = 0.10;
var track, SC;

SC.initialize({
  client_id: consumerKey
});

function setTimeline(data) {
  $('.comments-list').css('height', Math.round(data.duration * magnitude));

  $.get(host + '/tracks/' + trackID + '/comments?consumer_key=' + consumerKey, function(data) {
    data.sort(function(a,b) { return parseFloat(a.timestamp) - parseFloat(b.timestamp); } );
    var lastCommentTop = 0;
    var lastHeight;
    for (var i = 0; i < data.length; i++) {
      var thisTop = Math.round(data[i].timestamp * magnitude);
      if (thisTop < lastCommentTop + lastHeight) {
        thisTop = lastCommentTop + lastHeight;
      }
      $('.comments-list').append('<div id="comment-' + data[i].id + '" class="comment" style="top: ' + thisTop + 'px;">' + data[i].user.username + ': ' + data[i].body + '</div>');
      lastHeight = $('.comments-list .comment').last().outerHeight();
      lastCommentTop = thisTop;
    }
  });
}

function updateProgress() {
  $('.bar-progress').css('width', track.position / track.durationEstimate * 100 + '%');
  $('.comments-progress').css('top', Math.round(track.position  * magnitude) + 'px');
}

$(document).ready(function() {

  SC.whenStreamingReady(function() {
    track = SC.stream('/tracks/' + trackID, {
      autoPlay: false
    }, function(track) {
      track.play({
        whileplaying: function() {
          updateProgress();
        }
      });
      $.get(host + '/tracks/' + trackID + '?consumer_key=' + consumerKey, function(data) {
        setTimeline(data);
      });
    });
  });

  $('.status-control').click(function() {
    track.togglePause();
  });

  $('.progress-bar').click(function(e) {
    track.setPosition((e.pageX / $(window).width()) * track.durationEstimate);
  });

});
