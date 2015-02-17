function setTimeline(t){$(".track-title").html(t.user.username+' &mdash; "'+t.title+'"'),$(".comments-list").css("height",Math.round(t.duration*magnitude)),$(".comments-list .comment").remove(),$.get(host+"/tracks/"+t.id+"/comments?consumer_key="+consumerKey,function(t){t.sort(function(t,e){return parseFloat(t.timestamp)-parseFloat(e.timestamp)});for(var e,a=0,s=0;s<t.length;s++){var r=Math.round(t[s].timestamp*magnitude);a+e>r&&(r=a+e);var o=t[s].user.avatar_url;o=o.replace("-large.jpg","-badge.jpg"),$(".comments-list").append('<div id="comment-'+t[s].id+'" class="comment" style="top: '+r+'px;"><img class="avatar" src="'+o+'">'+t[s].user.username+": "+t[s].body+"</div>"),e=$(".comments-list .comment").last().outerHeight(),a=r}})}function updateProgress(t){var e;e=t>=0?t:track.position,$(".bar-progress").css("width",e/track.durationEstimate*100+"%"),$(".comments-progress").css("top",Math.round(e*magnitude)+"px");var a=$(".comments-progress").position().top,s=$(window).height()/2,r=a-s;Math.abs(r)>=0&&container.animate({scrollTop:r},0)}function setPosition(t){track.setPosition(t),updateProgress(t)}function setArtwork(t){if(t.artwork_url){var e=t.artwork_url;e=e.replace("-large.jpg","-t500x500.jpg"),container.css("background-image","url("+e+")")}}function loadTrack(t,e){$("body").addClass("track-selected"),track&&track.destruct(),SC.initialize({client_id:consumerKey}),$(".search-wrap").toggleClass("hide"),$(".status-control").addClass("playing"),$(".track-title, .comments-list").html(),playingElements.removeClass("hide"),SC.whenStreamingReady(function(){track=SC.stream("/tracks/"+t,{autoPlay:!1},function(a){$.get(host+"/tracks/"+t+"?consumer_key="+consumerKey,function(t){e||history.pushState("","New ID: "+t.id,"/#/"+t.id+"/"+t.permalink),document.title=t.title+" | ScrollPlay",setArtwork(t),setTimeline(t),a.play({whileplaying:function(){updateProgress()},onfinish:function(){$(".status-control").toggleClass("playing")}})}).fail(function(){playingElements.addClass("hide"),$(".search-toggle").trigger("click"),$(".search-results").addClass("filled").html("Track not found. Search again.")})})})}function loadTrackFromURL(t,e){var a=new RegExp("(#)/([0-9]+)");return a.exec(t)?(loadTrack(a.exec(t)[2],e),!0):!1}function audioScratch(){var t=$("audio#player-scratch")[0];t.play()}var consumerKey="9994e3c432c77379bee441c98b1a4082",host="https://api.soundcloud.com",magnitude=.1,container=$(".wrapper"),track,SC,playingElements=$(".progress-bar, .controls, .comments-progress");$(document).ready(function(){window.location.hash&&loadTrackFromURL(window.location.hash),$(".status-control").click(function(){track.position>=track.duration?loadTrack():track.togglePause(),$(this).toggleClass("playing")}),$(".progress-bar").click(function(t){setPosition(t.pageX/$(window).width()*track.durationEstimate)}),$(".search-toggle").click(function(){$(".search-wrap").toggleClass("hide"),$("#search-input").focus()}),$("#search-input").bind("propertychange change click keyup input paste",function(){var t=$(this).val();0===t.length?($(".search-results").html(""),$(".search-results").removeClass("filled")):t.length>2&&SC.get("/tracks?consumer_key="+consumerKey,{q:t},function(t){var e="";if(t.length<=1)e="No tracks found.";else for(var a=0;5>a&&(t[a].streamable===!0&&(e+='<div class="search-track" data-trackid="'+t[a].id+'">',t[a].artwork_url&&(e+='<img src="'+t[a].artwork_url+'">'),e+='<div class="meta"><div class="meta-title">'+t[a].title+'</div><div class="meta-artist">by '+t[a].user.username+"</div></div></div>"),a!=t.length-1);a++);$(".search-results").addClass("filled"),$(".search-results").html(e).promise().done(function(){$(".search-track").click(function(){loadTrack($(this).data("trackid"))})})})})}),$(window).on("popstate",function(){loadTrackFromURL(window.location.hash,!0),$(".search-wrap").addClass("hide")}),$("body").on("DOMMouseScroll mousewheel",function(t){return $("body").hasClass("track-selected")&&(audioScratch(),setPosition(t.originalEvent.detail>0||t.originalEvent.wheelDelta<0?track.position+100:track.position-100)),!1});