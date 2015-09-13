---
layout: post
title: Arnaud learns Scala - part 1
---

After having been a C++ developer for years, I started coding in java. But that was 10 years ago
and, although I am now a seasoned java developer, I feel kind of outdated when I see how functional
programming became more than a fashion. Switching entirely to functional programming would be quite
a big move but a language like scala claims to make object-oriented programming meet functional
programming... So I decided to learn scala, I'm 10 years late but it's never too late!

![The Scala Programming Language]({{ site.url }}/assets/scala-lang.org/smooth-spiral.png){: .arnodb-center-image }

More than learning scala because everyone knows scala, this decision aims at getting familiar with
real life functional programming. Morover a lot of scala developers claim it greatly improved the
quality of their object-oriented code and I believe them.

Entering the Scala world
------------------------

Well, this is the simplest thing to so, scala has a website dedicated to itself:
[The Scala Programming Language](http://www.scala-lang.org/) (http://www.scala-lang.org/). It
provides a huge amount of links to various documentation.

I started with the obvious [Getting
Started](http://www.scala-lang.org/documentation/getting-started.html) document and made the *Hello
World* program run properly. By the way, I am a linux user (this is not definitive ;-) ), more
precisely I am a Debian user, so `apt-get install scala` was enough to start coding in scala.

The computer I used is not very powerful, this is why I haven't installed any IDE yet. Fortunately
scala can be scripted:

{% highlight scala %}
#!/bin/sh
exec scala "$0" "$@"
!#
// Scala script
...
{% endhighlight %}

Then I was unsure where to go next. I found [A Scala Tutorial for Java
Programmers](http://docs.scala-lang.org/tutorials/scala-for-java-programmers.html). It is really
worth a reading.

Then I was eager to code a bit although I didn't know a lot.

Tower of Hanoi
--------------

This game is well known and I chose it to start my experiments (one would be surprised by the
variety of tools allowing the implementation of Tower of Hanoi :-) ). It took me 2 days and a lot of
stackoverflow pages) to write this small scala script:
[hanoi-1.scala
(GitHub)](https://github.com/arnodb/arnodb.learns.scala/blob/master/sandbox/hanoi-1.scala). A
seasoned scala developer may find it extremely poor, not efficient etc. But I learned a lot with it.

### Tower class ###

{% highlight scala %}
class Tower(val floors: ArrayStack[Int]) {

    def height = floors.size

    override def toString() = toStrings(24).mkString("\n")

    def floorSizeToString(s: Int, width: Int) = {
        val side = width / 2 - s
        (" " * side) + ("-" * (s * 2)) + (" " * side)
    }

    def floorToString(f: Int, width: Int) = {
        if(f < floors.size) floorSizeToString(floors(floors.size - f - 1), width) else (" " * width)
    }

    def toStrings(width: Int) = {
        floors.map(f => floorSizeToString(f, width))
    }

}
{% endhighlight %}

* the `val` keyword in front of `floors` automatically defines a getter, otherwise `myTower.floors` would not
work
* the `height` accessor is here to add a bit of semantic: the height of a tower is the number of
floors
* the rest is dedicated to generate a human readable representation of the tower, it helped me learn
	* how to join a list of strings (`mkString`)
	* how to repeat a string multiple times (`"..." * repeat `)
	* a simple map call, the first bit of functional programming (yeah!)

### Tower companion ###

{% highlight scala %}
object Tower {

    def foundation() = new Tower(new ArrayStack)

    def complete(bottom: Int) = range(bottom, 1)

    private def range(bottom: Int, top: Int) = new Tower(ArrayStack.range(top, bottom + 1))

}
{% endhighlight %}

I was a bit lazy but apparently the *companion* object is the pattern to use in scala in order to
create factory methods. My Tower companion allows to create a tower with no floor at all
(`foundation`) or a tower fully built with the first floor specified as argument and the last one of
size 1 (`complete`).

For the java programmers: a companion is kind of a class with static methods. Actually it is a
singleton but that makes no difference.

Technically a companion has access to private members, that may be useful. Moreover factory methods
in a companion do not require the `new` keyword whereas constructors do. Syntactic sugar...

### City class and companion ###

{% highlight scala %}
class City(val towers: Array[Tower]) {

    def size = towers.size

    override def toString() = {
        val cityHeight = 12
        // from top to bottom
        (for(level <- cityHeight - 1 to 0 by -1) yield {
            (for(tower <- towers) yield {
                tower.floorToString(level, 24)
            }).mkString(" ")
        }).mkString("\n") +"\n" + "^" * (24 * 3 + 2)
    }

}

object City {

    def apply(towers: Tower*) = new City(towers.toArray)

}
{% endhighlight %}

Two points:

* `yield` invokes the map function, very usefull!
* `apply` allows the following syntax: `City(...)` instead of `City.factory(...)`, very useful!

### Crane ###

Then we need a crane to move one floor from one tower to another:

{% highlight scala %}
object Crane {

    def move(city: City, from: Int, to: Int) {
        val fromTower = city.towers(from)
        val toTower = city.towers(to)
        if(toTower accepts fromTower) {
            toTower.floors push fromTower.floors.pop
        } else {
            println("Beep! Tower " + (to + 1) + " cannot receive the top of tower " + (from + 1))
        }
    }

}
{% endhighlight %}

Its purpose is only to check that the destination tower accepts the top floor of the source tower.
Note the infixed call to `Tower.accept` and `ArrayStack.push`. The `accepts` method is added to the
`Tower` class:

{% highlight scala %}
class Tower {

    def accepts(from: Tower) = {
        from.floors.size > 0 && (floors.size == 0 || from.floors.top < floors.top)
    }

}
{% endhighlight %}

### Movement algorithm, the functional way ###

Then comes the algorithm to move the floors from one tower to another. A very silly one that
recursively moves "all but the first floor" to the spare slot, moves "the first floor" to the
destination, and repeat the first operation to rebuild the top of the tower.


{% highlight scala %}
object Move {
    
    def superMove(height: Int, from: Int, to: Int, move: (Int, Int) => Unit): () => Unit = {
        height match {
            case 0 => () => ()
            case 1 => () => move(from, to)
            case _ => { 
                val s = Set(0, 1, 2)
                s -= from
                s -= to
                () => {
                    superMove(height - 1, from, s.head, move)()
                    move(from, to)
                    superMove(height - 1, s.head, to, move)()
                }
            }
        }
    }

}
{% endhighlight %}

* `superMove` aims at moving a given amount of floors from one tower to another
* it takes an elementary move callback whose prototype is defined by `(Int, Int) => Unit`, basically
a function that takes two integers
* it returns a function which we have to execute in order to perform the operation

The algorithm is simple and uses pattern matching (another scala great feature!) on the height parameter:

* moving 0 floors does nothing, a no-operation function with no parameter is returned: `() => ()`
* moving one floor calls the elementary move callback, a function with no parameter and calling
`move` is returned: `() => move(from, to)`
* the general case consists in moving one less floor from the source to the spare, moving the
underlying floor to the destination, and repeating the first operation to the destination

### Execution ###

{% highlight scala %}
def play {

    println("Building initial city...")

    val tower1 = Tower.complete(9)
    val tower2 = Tower.foundation
    val tower3 = Tower.foundation

    val city = City(tower1, tower2, tower3)

    println(city)

    var success = false
    var moves = 0
    println("Crane is on the move...")
    val go = Move.superMove(city.towers(0).height, 0, 2,
        (from: Int, to: Int) => {
            Crane move(city, from, to)
            println(city)
            moves += 1
            if(city.towers(0).height == 0 && city.towers(1).height == 0) {
                success = true
            }
        })

    go()

    println(
        if(success)
            "Clap clap clap! You are a certified Scala pig! :-) (" + moves + ")"
        else
            "Pffffff :-(( (" + moves + ")"
    )

}

play
{% endhighlight %}

* instantiation via the companion doesn't require the `new` keyword (towers)
* `apply` factory is implicit (city)
* the implementation of the elementary move calls the `Crane` object, prints the new state, counts
the moves and checks for success

Conclusion
----------

Phew, we made it!

The functional part was not so easy to write for the compiler messages are not always obvious.
Especially when the function return types are infered the error is often deported to the caller
code. I guess I will get used to identify the real problems after a few weeks of training.

When I started java I remember my first feeling: waouh, the compiler is so slow! That was biased by
the time it takes to start a JVM. With scala I have the exact same impression. I don't know whether
scala generates java byte code directly (I guess so) or asks the java compiler to compile some java
source code but this phase is CPU consuming. Anyway this doesn't apply in a non scripted enviroment.

The game also showed that I need to learn more about scala collections (mutable or immutable, etc.)
because it is not as obvious as in java. So that is one of my next steps forward along with reading
[Scala By Example](http://www.scala-lang.org/docu/files/ScalaByExample.pdf)

Links
-----

* [The Scala Programming Language](http://www.scala-lang.org/)
* [Getting Started](http://www.scala-lang.org/documentation/getting-started.html)
* [A Scala Tutorial for Java
Programmers](http://docs.scala-lang.org/tutorials/scala-for-java-programmers.html)
* [hanoi-1.scala on GitHub](https://github.com/arnodb/arnodb.learns.scala/blob/master/sandbox/hanoi-1.scala)
* [Scala By Example](http://www.scala-lang.org/docu/files/ScalaByExample.pdf)


