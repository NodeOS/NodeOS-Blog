# GitBlog
Blog engine using [GitHub](https://github.com/) issues as backend

[GitHub Pages](https://pages.github.com/) is a web hosting tool that allow to easily edit your webpages using [Jekyll](http://jekyllrb.com/), and that can be used to host your own blog. Problem is that it only allow to use static content, so you need to use external services as [Disquss](https://disqus.com/) to manage your blog comments.

[NodeOS](https://node-os.com/) team mostly use [GitHub issues](https://github.com/nodeos/nodeos/issues) and email for communication and notify and discuss updates and progress, so they are already being used as a blog engine. Needing to use another tool to receive users feedback was a wasted effort, so since it only needed a cleaner interface to don't scare non-tech savvy people... that's how GitBlog was worn :-)

# Features

* **server-less webapp**, it directly does request to [GitHub Issues API](https://developer.github.com/v3/issues/)

## Upcoming features

* **multi-page design** to show independent pages for each post
* **[user authentication](https://developer.github.com/v3/oauth/)** to override GitHub API limits

## Possible future features

* user comments
* integration with other platforms ([GitLab](https://gitlab.com/), [BitBucket](https://bitbucket.org/), [Google Code](https://code.google.com/), [Redmine](http://www.redmine.org/)...)
