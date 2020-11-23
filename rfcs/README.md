# Typed Ember RFCs

<i>(This document is intentionally effectively identical with the README for
[emberjs/rfcs](https://github.com/emberjs/rfcs/).)</i>

Many changes, including bug fixes and documentation improvements can be
implemented and reviewed via the normal GitHub pull request workflow.

Some changes though are "substantial", and we ask that these be put
through a bit of a design process and produce a consensus among the Ember
core teams.

The "RFC" (request for comments) process is intended to provide a
consistent and controlled path for new features to enter the framework.

[Active RFC List](https://github.com/emberjs/rfcs/pulls)

## When you need to follow this process

You need to follow this process if you intend to make "substantial"
changes to Ember, Ember Data, Ember CLI, their documentation, or any other
projects under the purview of the [Ember core teams](https://emberjs.com/team/).
What constitutes a "substantial" change is evolving based on community norms,
but may include the following:

   - A new feature that creates new API surface area, and would
     require a [feature flag] if introduced.
   - The removal of features that already shipped as part of the release
     channel.
   - The introduction of new idiomatic usage or conventions, even if they
     do not include code changes to Ember itself.

Some changes do not require an RFC:

   - Rephrasing, reorganizing or refactoring
   - Addition or removal of warnings
   - Additions that strictly improve objective, numerical quality
criteria (speedup, better browser support)
   - Additions only likely to be _noticed by_ other implementors-of-Ember,
invisible to users-of-Ember.

If you submit a pull request to implement a new feature without going
through the RFC process, it may be closed with a polite request to
submit an RFC first.

## Gathering feedback before submitting

It's often helpful to get feedback on your concept before diving into the
level of API design detail required for an RFC. **You may open an
issue on this repo to start a high-level discussion**, with the goal of
eventually formulating an RFC pull request with the specific implementation
 design. We also highly recommend sharing drafts of RFCs in `#dev-rfc` on 
the [Ember Discord](https://discord.gg/emberjs) for early feedback.

## The process

In short, to get a major feature added to Ember, one must first get the
RFC merged into the RFC repo as a markdown file. At that point the RFC
is 'active' and may be implemented with the goal of eventual inclusion
into Ember.

* Fork the RFC repo http://github.com/emberjs/rfcs
* Copy the appropriate template. For most RFCs, this is `0000-template.md`, 
for deprecation RFCs it is `deprecation-template.md`.
Copy the template file to `text/0000-my-feature.md`, where
'my-feature' is descriptive. Don't assign an RFC number yet.
* Fill in the RFC. Put care into the details: **RFCs that do not
present convincing motivation, demonstrate understanding of the
impact of the design, or are disingenuous about the drawbacks or
alternatives tend to be poorly-received**.
* Submit a pull request. As a pull request the RFC will receive design
feedback from the larger community, and the author should be prepared
to revise it in response.
* Update the pull request to add the number of the PR to the filename and 
add a link to the PR in the header of the RFC.
* Build consensus and integrate feedback. RFCs that have broad support
are much more likely to make progress than those that don't receive any
comments.
* Eventually, the Typed Ember team will decide whether the RFC is a candidate
for inclusion by ember-cli-typescript.
* RFCs that are candidates for inclusion will enter a "final comment period"
lasting 7 days. The beginning of this period will be signaled with a comment
and tag on the RFC's pull request. Furthermore, the Typed Ember team will post
in Discord in `#e-typescript` and `#news-and-announcements`.
* An RFC can be modified based upon feedback from the Typed Ember team and
the community. Significant modifications may trigger a new final comment period.
* An RFC may be rejected by the team after public discussion has settled and
comments have been made summarizing the rationale for rejection. The RFC will
enter a "final comment period to close" lasting 7 days. At the end of the 
"FCP to close" period, the PR will be closed.
* An RFC may also be closed by the core teams if it is superseded by a merged
RFC. In this case, a link to the new RFC should be added in a comment.
* An RFC author may withdraw their own RFC by closing it themselves.
* An RFC may be accepted at the close of its final comment period. A [core team]
member will merge the RFC's associated pull request, at which point the RFC will
become 'active'.

## The RFC life-cycle

Once an RFC becomes active the relevant teams will plan the feature and create 
issues in the relevant repositories.
Becoming 'active' is not a rubber stamp, and in particular still does not mean 
the feature will ultimately be merged; it does mean that the core team has agreed 
to it in principle and are amenable to merging it.

Furthermore, the fact that a given RFC has been accepted and is
'active' implies nothing about what priority is assigned to its
implementation, nor whether anybody is currently working on it.

Modifications to active RFC's can be done in followup PR's. We strive
to write each RFC in a manner that it will reflect the final design of
the feature; but the nature of the process means that we cannot expect
every merged RFC to actually reflect what the end result will be at
the time of the next major release; therefore we try to keep each RFC
document somewhat in sync with the feature as planned,
tracking such changes via followup pull requests to the document.

## Implementing an RFC

The author of an RFC is not obligated to implement it. Of course, the
RFC author (like any other developer) is welcome to post an
implementation for review after the RFC has been accepted.

If you are interested in working on the implementation for an 'active'
RFC, but cannot determine if someone else is already working on it,
feel free to ask (e.g. by leaving a comment on the associated issue).

## For Core Team Members

### Reviewing RFCs

Each core team is responsible for reviewing open RFCs. The team must ensure 
that if an RFC is relevant to their team's responsibilities the team is 
correctly specified in the 'Relevant Team(s)' section of the RFC front-matter.
The team must also ensure that each RFC addresses any consequences, changes, or
work required in the team's area of responsibility.

As it is with the wider community, the RFC process is the time for 
teams and team members to push back on, encourage, refine, or otherwise comment 
on proposals.

### Referencing RFCs

- When mentioning RFCs that have been merged, link to the merged version, 
not to the pull-request.
