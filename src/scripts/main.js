var consumerKey = '9994e3c432c77379bee441c98b1a4082';
var host = 'https://api.soundcloud.com';
var trackID = 90243759;
var magnitude = 0.10;
var container = $('.wrapper');
var track, SC;

SC.initialize({
  client_id: consumerKey
});

function setTimeline(data) {
  $('.track-title').html(data.user.username + ' &mdash; "' + data.title + '"');
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
      $('.comments-list').append('<div id="comment-' + data[i].id + '" class="comment" style="top: ' + thisTop + 'px;"><img class="avatar" src="' + data[i].user.avatar_url + '">' + data[i].user.username + ': ' + data[i].body + '</div>');
      lastHeight = $('.comments-list .comment').last().outerHeight();
      lastCommentTop = thisTop;
    }
  });
}

function updateProgress(givenposition) {
  var newposition;
  if (givenposition >= 0) {
    newposition = givenposition;
  } else {
    newposition = track.position;
  }

  $('.bar-progress').css('width', newposition / track.durationEstimate * 100 + '%');
  $('.comments-progress').css('top', Math.round(newposition  * magnitude) + 'px');

  var progressTop = $('.comments-progress').position().top;
  var windowYCenter = $(window).height() / 2;
  var diffY = progressTop - windowYCenter;

  if (Math.abs(diffY) >= 0) {
    container.animate({
      scrollTop: diffY
    }, 0);
  }
}

function setArtwork(data) {
  if (data.artwork_url) {
    container.css('background-image', 'url(' + data.artwork_url + ')');
  }
}

function loadTrack() {
  SC.whenStreamingReady(function() {
    track = SC.stream('/tracks/' + trackID, {
      autoPlay: false
    }, function(track) {
      $.get(host + '/tracks/' + trackID + '?consumer_key=' + consumerKey, function(data) {
        setArtwork(data);
        setTimeline(data);
      });
      track.play({
        whileplaying: function() {
          updateProgress();
        },
        onfinish: function() {
          $('.status-control').toggleClass('playing');
        }
      });
    });
  });
}

$(document).ready(function() {

  loadTrack();

  $('.status-control').click(function() {
    if (track.position >= track.duration) {
      loadTrack();
    } else {
      track.togglePause();
    }
    $(this).toggleClass('playing');
  });

  $('.progress-bar').click(function(e) {
    var newposition = (e.pageX / $(window).width()) * track.durationEstimate;
    track.setPosition(newposition);
    updateProgress(newposition);
  });

});
