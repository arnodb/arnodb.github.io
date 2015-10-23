// nodejs generate_github_data.js -f arnodb >| ../_data/github_arnodb.yml

var GitHubApi = require("github");
var yaml = require('js-yaml');
var getopt = require('posix-getopt');

function parseArguments() {
    var config = {
        auth_user : undefined,
        auth_password : undefined,
        forks : true
    };

    var parser = new getopt.BasicParser('f(noforks)p:u:', process.argv);

    var option;
    while ((option = parser.getopt()) !== undefined && !option.error) {
        switch (option.option) {
            case 'f':
                config.forks = false;
                break;
            case 'p':
                config.auth_password = option.optarg;
                break;
            case 'u':
                config.auth_user = option.optarg;
                break;
        }
    }
    if (option && option.error) {
        throw 'invalid option ' + JSON.stringify(option);
    }

    if (parser.optind() >= process.argv.length)
        throw 'missing required argument: "user"';
    config.user = process.argv[parser.optind()];

    return config;
}

var config = parseArguments();

var github = new GitHubApi({
    version: "3.0.0",
    timeout: 5000
});

if (config.auth_user && config.auth_password) {
    github.authenticate({
        type: "basic",
        username: config.auth_user,
        password: config.auth_password
    });
}

var CompletionCounter = function(complete) {
    this.counter = 0;
    this.complete = complete;
};

CompletionCounter.prototype.update = function(diff) {
    this.counter += diff;
    if (this.counter == 0)
        this.complete();
    else if (this.counter < 0)
        throw 'Oops ' + this.counter + ' < 0';
};

function getRepoBranches(repo, options, outRepo, complete) {
    github.repos.getBranches({
        user : repo.owner.login,
        repo : repo.name
    }, function(err, branches) {
        if (err)
            throw err;
        var comp = new CompletionCounter(function() {
            complete();
        });
        for (var bi = 0; bi < branches.length; ++bi) {
            var branch = branches[bi];
            var outBranch = {
                name : branch.name
            };
            outRepo.branches.push(outBranch);
        }
        complete();
    });
};

function getRepos(user, options, outRepos, complete) {
    github.repos.getFromUser({ user : user }, function(err, repos) {
        if (err)
            throw err;
        var comp = new CompletionCounter(function() {
            complete();
        });
        for (var ri = 0; ri < repos.length; ++ri) {
            var repo = repos[ri];
            if (!options.forks && repo.fork) {
                continue;
            }
            var outRepo = {
                owner : {
                    login : repo.owner.login
                },
                name : repo.name,
                full_name : repo.full_name,
                branches : []
            };
            outRepos.push(outRepo);
            comp.update(1);
            getRepoBranches(repo, options, outRepo, function() {
                comp.update(-1);
            });
        }
    });
};

var githubData = [];
getRepos(config.user, {
    forks : config.forks
}, githubData, function() {
    process.stdout.write(yaml.safeDump(githubData));
});

