var consumerKey = '9994e3c432c77379bee441c98b1a4082';
var host = 'https://api.soundcloud.com';
var magnitude = 0.10;
var container = $('.wrapper');
var track, SC;

SC.initialize({
  client_id: consumerKey
});

function setTimeline(data) {
  $('.track-title').html(data.user.username + ' &mdash; "' + data.title + '"');
  $('.comments-list').css('height', Math.round(data.duration * magnitude));

  $.get(host + '/tracks/' + data.id + '/comments?consumer_key=' + consumerKey, function(data) {
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
    var tempArtwork = data.artwork_url;
    tempArtwork = tempArtwork.replace('-large.jpg', '-t500x500.jpg');
    container.css('background-image', 'url(' + tempArtwork + ')');
  }
}

function loadTrack(trackID) {
  $('.progress-bar, .status-control, .comments-progress').removeClass('hide');

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

  $('#search-input').bind('propertychange change click keyup input paste', function() {
    var searchQuery = $(this).val();
    if (searchQuery.length === 0) {
      $('.search-results').html();
      $('.search-results').removeClass('filled');
    } else if (searchQuery.length > 2) {
      SC.get('/tracks', { q: searchQuery }, function(tracks) {
        var searchResultsHTML = '';
        if (tracks.length <= 1) {
          searchResultsHTML = 'No tracks found.';
        } else {
          for (var i = 0; i < 5; i++) {
            if (tracks[i].streamable === true) {
              searchResultsHTML += '<div class="search-track" data-trackid="' + tracks[i].id + '">' + tracks[i].title + '</div>';
            }
            if (i == tracks.length - 1) {
              break;
            }
          }
        }
        $('.search-results').addClass('filled');
        $('.search-results').html(searchResultsHTML).promise().done(function() {
          $('.search-track').click(function() {
            loadTrack($(this).data('trackid'));
            $('.status-control').addClass('playing');
          });
        });
      });
    }
  });

});
