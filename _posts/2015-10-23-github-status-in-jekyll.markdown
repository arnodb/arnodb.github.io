---
layout: post
title: GitHub status in Jekyll
published: false
---

GitHub continuous integration status of multiple repositories in a single Jekyll page.

Today I hacked the following chain of events:

* get information about GitHub repositories via the GitHub API
* generate YAML files to feed Jekyll with
* use a Jekyll template to generate a page with Travis CI and Coveralls status badges

Get information form GitHub
---------------------------

This is mainly a Node.js script using the following plugins:

* [github](https://github.com/ajaxorg/node-github) (ah, asynchronous HTTP requests...)
* [js-yaml](https://github.com/nodeca/js-yaml)
* [posix-getopt](https://github.com/davepacheco/node-getopt) (I really missed args4j)

See [generate_github_data.js](https://github.com/arnodb/arnodb.github.io/blob/master/_github/generate_github_data.js).

Jekyll template
---------------

The template reads data in ``_data/somefile.yml`` generated by the script mentioned earlier and
generates proper HTML to display the repository names, and the CI badges. The main fragment of the
template is in a layout file:

{% highlight html %}
{% raw %}
    {% for data_key in page.github_data %}
    <div class="github-status">
      {% for repo in site.data[data_key] %}
      <div class="github-repo"><a href="https://github.com/{{ repo.full_name }}">{{ repo.full_name
}}</a></div>
        {% for branch in repo.branches %}
      <div class="github-status-line">
        <span class="github-branch">Branch: <span class="github-branch-name">{{ branch.name
}}</span></span>
        <span class="travis-badge"><a href="https://travis-ci.org/{{ repo.owner.login |
url_param_escape }}/{{ repo.name | url_param_escape }}"><img alt="Build Status"
src="https://travis-ci.org/{{ repo.owner.login | url_param_escape }}/{{ repo.name | url_param_escape
}}.svg?branch={{ branch.name | url_param_escape }}" /></a></span>
        <span class="coveralls-badge"><a href="https://coveralls.io/github/{{ repo.owner.login |
url_param_escape }}/{{ repo.name | url_param_escape }}?branch={{ branch.name | url_param_escape
}}"><img alt="Coverage Status" src="https://coveralls.io/repos/{{ repo.owner.login |
url_param_escape }}/{{ repo.name | url_param_escape }}/badge.svg?branch={{ branch.name |
url_param_escape }}&service=github" /></a></span>
      </div>
        {% endfor %}
      {% endfor %}
    </div>
    {% endfor %}
    {{ content }}
{% endraw %}
{% endhighlight %}

See the real life example in [arnodb.github.io](https://github.com/arnodb/arnodb.github.io/) GitHub repository.

Result
------

![GitHub Status]({{ site.url }}/assets/github-status.png){: .arnodb-center-image .arnodb-image-border }

Obviously I have some work to do to fix a build and improve test coverage ;-).

See the repositories I am following here: [Arno.db GitHub Status]({{ site.baseurl }}/github/).

