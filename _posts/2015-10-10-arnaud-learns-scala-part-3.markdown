---
layout: post
title: Arnaud learns Scala - part 3
---

A small heartbeat after a long quiet period... building scala projects with *Scala Build Tool*
a.k.a. [sbt](http://www.scala-sbt.org/), and unit testing.

Preamble
--------

At the end of [Arnaud learns Scala - part 2]({% post_url 2015-09-20-arnaud-learns-scala-part-2 %})
I figured out that the performance of loops may vary from "good" to "atrocious" depending on how you
write them. However I did not have the time to investigate further and temporarily concluded "do NOT
write ``for (i <- min to max)`` as a replacement of ``for(int i = min; i < max + 1; ++i)``". This
will probably be the subject of a future post.

Back to this evening's point: building and testing. This is always important to build apps or libraries
properly and even more important to write tests. Two subject overlooked so many times!

Building scala projects
-----------------------

![Scala Build Tool]({{ site.url }}/assets/scala-sbt.org/typesafe_sbt_svg.svg){: width="370px" height="160px" .arnodb-center-image }

[sbt](http://www.scala-sbt.org/) is the *Scala Build Tool*. It is similar to Maven for java projects
in the way it manages dependencies, even better: it may find dependencies in Maven central
repositories.

Learning build tools is always long and boring, but I'm afraid the only way to go is to RTFM. The
good news is that the sbt documentation is of good quality. You may find it at
[sbt - Documentation](http://www.scala-sbt.org/documentation.html).

In order to make it less boring I learned with a real case: an implementation of the Canny edge
detector ported to scala by Bibi. The original code may be found at
[CannyEdgeDetector.java](http://www.tomgibara.com/computer-vision/CannyEdgeDetector.java) and my
scala version at
[canny-edge-detector on GitHub](https://github.com/arnodb/arnodb.learns.scala/tree/master/canny-edge-detector)

Like Maven, sbt uses a descriptive way to configure a project. However it is actually scala code,
the documentation tells more about that. The VERY good news is that is isn't XML!

Basically the initialization of a project consists in writing a *build.sbt* file and putting scala code
in *src/main/scala*.

So far my *build.sbt* file looks like this:

{% highlight scala %}
lazy val commonSettings = Seq(
    organization := "io.github.arnodb",
    version := "0.1.0",
    scalaVersion := "2.11.6"
)

lazy val root = (project in file(".")).
    settings(commonSettings: _*).
    settings(
        name := "canny-edge-detector",
        libraryDependencies ++= Seq(
            "org.specs2" %% "specs2-core" % "3.6.4" % "test"
        )
    )
{% endhighlight %}

This is slightly more concise than a *pom.xml*, isn't it?

Testing scala code
------------------

After a bit of googling, I found the following list:
[specs2](https://etorreborre.github.io/specs2/), [ScalaCheck](https://www.scalacheck.org/), and
[ScalaTest](http://www.scalatest.org/).

After a bit more googling, I found this very interesting article
[Which Scala Testing Tools Should You Use?](http://tech.gilt.com/2013/09/27/which-scala-testing-tools-should-you-use/)
and decided to try *specs2*, keeping the other options apart but close at hand.

![specs2]({{ site.url }}/assets/etorreborre.github.io/specs2.png){: .arnodb-center-image }

With the help of the user guide available on the website (see link above), my Canny edge detector
project gained the following test specification:

{% highlight scala %}
import org.specs2._
import matcher.DataTables

class CannyEdgeDetectorKernelSpec extends Specification with matcher.DataTables {

    def is = s2"""
A Kernel instance
  must have a width <= the specified width                       $width
  must contain an array of size equal to its width               $kernelSize
  must contain a diff array of size equal to its width           $diffKernelSize
  must have a short description                                  $toStringValue
                                                                 """

    val table = "radius" | "width" | "description" |>
        1f ! 2 ! "Kernel(0.14668746, 0.096218705)" |
        2f ! 12 ! "Kernel(0.038972624, 0.034570705, 0.024127936, ...)" |
        3f ! 42 ! "Kernel(0.017521275, 0.016591392, 0.014087467, ...)"

    def width = {
        table | {
            (r, w, d) => {
                Kernel(r, w).width must be_<=(w)
            }
        }
    }
    def kernelSize = {
        table | {
            (r, w, d) => {
                val k = Kernel(r, w)
                k.kernel must have size(k.width)
            }
        }
    }
    def diffKernelSize = {
        table | {
            (r, w, d) => {
                val k = Kernel(r, w)
                k.diffKernel must have size(k.width)
            }
        }
    }
    def toStringValue = {
        table | {
            (r, w, d) => {
                val k = Kernel(r, w)
                k.toString must be equalTo(d)
            }
        }
    }

}
{% endhighlight %}

Honestly I find it quite difficult to write tests that actually compile. I spent 2 hours playing
with tuples in order to run tests with multiple inputs. So this investigation is not finished, the
online documentation is not perfect but it exists (see link above).

Conclusion
----------

As I said, those two subjects are boring but they are essential. It requires multiple readings of
the online documentation and foremost it requires implementation.

Find final word this evening will be:

> Don't be afraid, start with poor but working project definitions and test specifications, refine
> your experience and refine your work regularly.

